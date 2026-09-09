import{r as e,t}from"./react.OrosJ8bI.js";import{t as n}from"./jsx-runtime.D7zcSYNz.js";var r=e(t(),1),i=n(),a=`
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`,o=`
  #extension GL_OES_standard_derivatives : enable
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;

  // Ashima's WebGL-noise https://github.com/ashima/webgl-noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    // Fix aspect ratio so lines don't stretch on wide screens
    st.x *= u_resolution.x / u_resolution.y;
    
    // Scale the space to get more/fewer lines
    st *= 1.5;

    // We add a very slow time evolution to the noise input
    float t = u_time * 0.01; 
    
    // Use layered noise for a more organic look
    float n = snoise(st + vec2(t, t * 0.5)) * 0.5 + 0.5;
    n += snoise(st * 2.0 - vec2(t * 0.2, t * 0.3)) * 0.25;
    
    // Number of contour bands
    float bands = 6.0;
    float n_scaled = n * bands;
    
    // fwidth gives the change in n_scaled over 1 pixel
    // This allows us to maintain a constant line thickness on screen
    float fw = fwidth(n_scaled);
    
    // Set the desired line width in pixels
    float lineWidthPixels = 1.5;
    float edge = lineWidthPixels * fw;
    
    // Create the topography lines
    float lines = fract(n_scaled);
    
    // Sharp binarization effect with constant thickness
    float line = 1.0 - step(edge, lines);
    
    // Base color: #fafafa (RGB: 250/255 = 0.98, 0.98, 0.98)
    vec3 bgColor = vec3(0.98, 0.98, 0.98);
    // Line color: faint gray/blue (RGB: 0.85, 0.88, 0.9)
    vec3 lineColor = vec3(0.95, 0.95, 0.95);
    
    vec3 color = mix(bgColor, lineColor, line);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;function s(){let e=(0,r.useRef)(null);return(0,r.useEffect)(()=>{let t=e.current;if(!t)return;let n=t.getContext(`webgl`)||t.getContext(`experimental-webgl`);if(!n)return;n.getExtension(`OES_standard_derivatives`);let r=(e,t)=>{let r=n.createShader(e);return r?(n.shaderSource(r,t),n.compileShader(r),n.getShaderParameter(r,n.COMPILE_STATUS)?r:(console.error(`Shader compile failed:`,n.getShaderInfoLog(r)),n.deleteShader(r),null)):null},i=r(n.VERTEX_SHADER,a),s=r(n.FRAGMENT_SHADER,o);if(!i||!s)return;let c=n.createProgram();if(!c)return;if(n.attachShader(c,i),n.attachShader(c,s),n.linkProgram(c),!n.getProgramParameter(c,n.LINK_STATUS)){console.error(`Program link failed:`,n.getProgramInfoLog(c));return}n.useProgram(c);let l=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),u=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,u),n.bufferData(n.ARRAY_BUFFER,l,n.STATIC_DRAW);let d=n.getAttribLocation(c,`a_position`);n.enableVertexAttribArray(d),n.vertexAttribPointer(d,2,n.FLOAT,!1,0,0);let f=n.getUniformLocation(c,`u_resolution`),p=n.getUniformLocation(c,`u_time`),m,h=performance.now(),g=()=>{let e=window.devicePixelRatio||1;t.width=window.innerWidth*e,t.height=window.innerHeight*e,t.style.width=window.innerWidth+`px`,t.style.height=window.innerHeight+`px`,n.viewport(0,0,t.width,t.height)};window.addEventListener(`resize`,g),g();let _=e=>{let r=(e-h)*.001;n.uniform2f(f,t.width,t.height),n.uniform1f(p,r),n.drawArrays(n.TRIANGLES,0,6),m=requestAnimationFrame(_)};return m=requestAnimationFrame(_),()=>{window.removeEventListener(`resize`,g),cancelAnimationFrame(m),n.deleteProgram(c)}},[]),(0,i.jsx)(`canvas`,{ref:e,style:{position:`fixed`,top:0,left:0,width:`100vw`,height:`100vh`,zIndex:-1,pointerEvents:`none`}})}export{s as default};