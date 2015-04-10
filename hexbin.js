---
---
;(function(){
  var data = {{site['data']['hexbin']|jsonify}};

  var cwidth = data['cell']['width'],
      cheight = data['cell']['height'],
      border = data['cell']['border'];    

  var width = window.innerWidth,
      height = window.innerHeight;

  var ncol = Math.ceil( width / cwidth ) + 2 ,
      nrow = Math.ceil( height / cheight ) + 2;

  var shift = function(r){
        return ((r%2)==0)?0:(cwidth/2);
      };
  var currentFocus = [width / 2, height / 2],
      desiredFocus,
      idle = true;

  function d2r(d){
    return d*(Math.PI/180);
  }

  function templater( ){
    var shift = [];
    if ( data['type'] == 'circle'){
     var type= 'circle',
         shift=[cwidth,Math.sqrt(3)*cheight/2],
         attr = {
           'cx': function(c){
                  console.log('cx',c)
                        return (c*cwidth+cwidth/2)
                    },
           'cy': function(c){
                        return (cheight/2)
                    },
           'r': (cwidth/2) - border,
         };

    } else if ( data['type'] == 'hexagon'){
      type = 'polygon';
      var cr = Math.sqrt(3) * cwidth/3 - border;
      shift=[Math.sqrt(3)*cwidth/2,Math.sqrt(3)*cheight/2],
      attr = {
        'points': function(c){
          return d3.range(6)
                 .map( function(i){ 
                      return (cr*Math.cos( d2r( i*60 + 30) ) + (c*cwidth+cwidth/2)) +','+ (cr*Math.sin( d2r( i*60+ 30) ) + cheight/2);
                    })
                    .join(' ');
        }
      };
    }
    return {
      'type': type,
      'shift': shift,
      'attr':attr ,
    }
  }


  var style = document.body.style,
      transform = ("webkitTransform" in style ? "-webkit-"
            : "MozTransform" in style ? "-moz-"
            : "msTransform" in style ? "-ms-"
            : "OTransform" in style ? "-o-"
            : "") + "transform";



  var type = templater();
  svg = d3.select('hexbin')
      .style('overflow-x','hidden')
      .append('svg')
      .style('position','fixed')
      .style('top','0px')
      .style('left','0px')
      .style('border','20px')
      .attr('height', height)
      .attr('width', width)
      // append rows
  g = svg.append('g')
         .attr('transform','translate('+(-1*width/4)+')');      
  pattern = g.append('defs') 
      .selectAll('.pattern')
      .data( data['item'] )
      .call( function(s){
         s.enter()
          .append('pattern')
          .attr('x',0).attr('y',0) 
          .attr('width',cwidth).attr('height',cheight)
          .attr('patternUnits','userSpaceOnUse')
          .each( function(d,i){
            var id = 'pattern-image-'+i;

            d3.select(this)
              .datum( function(d){
                d['id'] = '#'+id;
                return d;
              });

            d3.select(this)
              .attr( 'id', id );

          })
          .each( function(d,i){
              d3.select(this) 
                .append('image')
                .attr('x',0).attr('y',0) 
                .attr('width',cwidth).attr('height',cheight)
                .attr('xlink:href', d['img'])
                .attr('type', 'image/png')
          })
      }).data()


  g.selectAll('.row')
      .data( d3.range( nrow ) )
      .call( function(s){
         s.enter()
          .append('g')
          .classed('row',true)
          .attr( 'transform', function(r){
            return 'translate('+shift(r)+','+ type['shift'][1]*(r-1) +')';
          })
          .each( function(r){
              d3.select(this)
                .selectAll('.cell')
                .data( d3.range( ncol ) )
                .call( function(s){
                  s.enter()
                    .append( type['type']) //in the yaml
                    .classed('cell',true)
                    .each( function(c){
                        var _this = this;
                        d3.entries( type['attr'] )
                          .forEach( function(kv){
                            d3.select( _this )
                              .attr( kv['key'], kv['value'] );
                          })
                    })
                    .attr( 'fill', function(c){
                      var id = pattern[ (r*ncol+c)%pattern.length ]['id'];
                      return "url("+id+")"
                    })
                    .attr( 'fill-opacity', ".6")      
              });
          })

      });


  //Make defs -> patterns
  // append ids to pattern data
  //Make SVG Polygons
  //Add Interactions to Polygons
  //Add Transition to polygons


    d3.selectAll( '.cell' )
      .on( 'mouseenter', function(){
        d3.select(this)
          .attr( 'fill-opacity',1)
      })
      .on( 'mouseleave', function(){
        d3.select(this)
          .transition( )
          .attr( 'fill-opacity',.6)
      })
      .on( 'click', function(d,i){
         // go somewhere
      })


    function mousemoved() {
      var m = d3.mouse(this);

      desiredFocus = [
        Math.round((m[0] - width / 2) / nrow) * nrow + width / 2,
        Math.round((m[1] - height / 2) / nrow) * nrow + height / 2
      ];

      moved();
    }

    function moved() {
        if (idle) d3.timer(function() {

          if (idle = Math.abs(desiredFocus[0] - currentFocus[0]) < .5 && Math.abs(desiredFocus[1] - currentFocus[1]) < .5) 
              currentFocus = desiredFocus;
          else currentFocus[0] += (desiredFocus[0] - currentFocus[0]) * .14, currentFocus[1] += (desiredFocus[1] - currentFocus[1]) * .14;
          g.style(transform, "translate(" + ( (width / 2 - currentFocus[0]) / nrow - (width/4)) + "px," + (height / 2 - currentFocus[1]) / nrow + "px)");
          return idle;
        });
      }


    svg.on('mousemove', mousemoved )
})();  