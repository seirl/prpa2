#version 330 core

out vec3 fragColor;

uniform vec2 iResolution;
uniform float iGlobalTime;
uniform float FPS;

float height;

#define LIGHT
#define SHADOWS
#define FPSCOUNT
#define TEXTURE
#define TRANSPARENCY

#define MAXSTEP     100.0
#define FAR         45.0
#define SPEED       0.2
#define DIST        9.0
#define DETAIL      0.000001

#define PI          3.141592653589793
#define PI_2        1.5707963267948966
#define PI_4        0.7853981633974483

#define WALL_THICKNESS  0.02
#define BEAM_THICKNESS  0.01
#define BEAM_WIDTH      0.05
#define FLOOR_HEIGHT    1.5
#define ELEVATOR_HEIGHT (FLOOR_HEIGHT * 0.85)
#define H_BEAM_HEIGTH   (FLOOR_HEIGHT - BEAM_WIDTH - 0.1)
#define ADD vec2(1.0, 0.0)
#define MOD2 vec2(3.07965, 7.4235)

// Transparency = mod(id, 16)
#define GROUND_ID   0x00
#define WALL_ID     0x10
#define BEAM_ID     0x20
#define WINDOW_ID   0x35
#define STRUCT_ID   0x40
#define CABLE_ID    0x50
#define METAL_ID    0x60
#define DOORWAY_ID  0x70 // Should not be seen
#define SCENE_ID    0x80

int numbers_display(int i)
{
    switch (i)
    {
        // 0
        case 0: return 7;
        case 1: return 5;
        case 2: return 5;
        case 3: return 5;
        case 4: return 7;
        // 1
        case 5: return 6;
        case 6: return 2;
        case 7: return 2;
        case 8: return 2;
        case 9: return 7;
        // 2
        case 10: return 6;
        case 11: return 1;
        case 12: return 2;
        case 13: return 4;
        case 14: return 7;
        // 3
        case 15: return 7;
        case 16: return 1;
        case 17: return 3;
        case 18: return 1;
        case 19: return 7;
        // 4
        case 20: return 2;
        case 21: return 4;
        case 22: return 7;
        case 23: return 2;
        case 24: return 2;
        // 5
        case 25: return 7;
        case 26: return 4;
        case 27: return 6;
        case 28: return 1;
        case 29: return 6;
        // 6
        case 30: return 7;
        case 31: return 4;
        case 32: return 7;
        case 33: return 5;
        case 34: return 7;
        // 7
        case 35: return 7;
        case 36: return 1;
        case 37: return 3;
        case 38: return 6;
        case 39: return 4;
        // 8
        case 40: return 7;
        case 41: return 5;
        case 42: return 7;
        case 43: return 5;
        case 44: return 7;
        // 9
        case 45: return 7;
        case 46: return 5;
        case 47: return 7;
        case 48: return 1;
        case 49: return 7;
    }
}

int dot_display(int i)
{
    switch (i)
    {
        case 0: return 0;
        case 1: return 0;
        case 2: return 0;
        case 3: return 0;
        case 4: return 1;
    }
}

int f_display(int i)
{
    switch (i)
    {
        case 0: return 7;
        case 1: return 4;
        case 2: return 6;
        case 3: return 4;
        case 4: return 4;
    }
}

int p_display(int i)
{
    switch (i)
    {
        case 0: return 7;
        case 1: return 5;
        case 2: return 7;
        case 3: return 4;
        case 4: return 4;
    }
}

int s_display(int i)
{
    switch (i)
    {
        case 0: return 3;
        case 1: return 4;
        case 2: return 2;
        case 3: return 1;
        case 4: return 6;
    }
}

int colon_display(int i)
{
    switch (i)
    {
        case 0: return 0;
        case 1: return 1;
        case 2: return 0;
        case 3: return 1;
        case 4: return 0;
    }
}

float FPSDisplay(vec2 uv)
{
    if ((uv.x < 0.) || (uv.x >= 32.) || (uv.y < 0.) || (uv.y >= 5.))
        return -1.0;
    int i = 1;
    int bit = int(pow(2., floor(32. - uv.x)));

    int line = int(5 - uv.y);
    i = f_display(line) << 28;
    i |= p_display(line) << 24;
    i |= s_display(line) << 20;

    i |= colon_display(line) << 18;

    i |= numbers_display(5 * int(mod((FPS / 100), 10)) + line) << 14;
    i |= numbers_display(5 * int(mod((FPS / 10), 10)) + line) << 10;
    i |= numbers_display(5 * int(mod(FPS, 10)) + line) << 6;
    i |= dot_display(line) << 4;
    i |= numbers_display(5 * int(mod(FPS * 10, 10)) + line);

    i /= bit;

    return float(i - 2 * (i / 2));
}

float noise(in vec2 p)
{
    vec2 f = fract(p);
    p = floor(p);
    float v = p.x + p.y * 1000.0;
    vec4 r = vec4(v, v + 1.0, v + 1000.0, v + 1001.0);
    r = fract(100000.0 * sin(r * 0.001));
    f = f * f * (3.0 - 2.0 * f);
    return 2.0 * (mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y)) - 1.0;
}

float noise(in vec3 p)
{
    return noise(p.xy);
}

const mat2 m2 = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(in vec2 p)
{
    float z = 2.0;
    float rz = 0.0;
    for (float i = 1.0; i < 7.0; i++)
    {
        rz += abs((noise(p) - 0.5) * 2.) / z;
        z = z * 2.0;
        p = p * 2.0;
        p *= m2;
    }
    return rz;
}

vec3 texStain(vec3 p, vec3 c1, vec3 c2, float power)
{
    return mix(c1, c2, smoothstep(0.2, 0.8, pow(fbm(p.xy) * p.z, power)));
}

vec3 texBeam(vec3 p)
{
    return mix(vec3(0.1, 0.1, 0.1), vec3(0.3, 0.3, 0.3),
            (fbm(floor(300.*(p.xy+p.yz))) + 1.0) / 2.0);
}

#define cubes_minStep 0.1
#define cubes_maxStep 45.0
#define cubes_delta 0.01
#define cubes_damping 0.9
#define cubes_numSteps 100

float cubes_opRep(vec3 p, vec3 c , vec3 e)
{
    vec3 q = mod(p,c)-0.5*c;
    vec3 d = abs(q) - e;
    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float cubes_distf (vec3 pos)
{
    return cubes_opRep(pos,vec3(2.0),vec3(0.2));
}

vec3 cubes_normal(vec3 p)
{
    vec2 dm = vec2(cubes_delta, 0.0);
    return normalize(vec3(
        cubes_distf(p+dm.xyy) - cubes_distf(p-dm.xyy),
        cubes_distf(p+dm.yxy) - cubes_distf(p-dm.yxy),
        cubes_distf(p+dm.yyx) - cubes_distf(p-dm.yyx)
    ));
}

float cubes_castRay(vec3 pos, vec3 dir, out vec3 norm)
{
    pos.z += iGlobalTime * 3;
    float dist = cubes_minStep;
    for(int step = 0; step < cubes_numSteps; step++)
    {
        norm = pos + dir*dist;
        float normL = cubes_distf(norm);
        if(normL > cubes_delta || dist > cubes_maxStep){
            dist += normL*cubes_damping;
        }
    }
    return dist;
}


vec3 cubes(vec3 ro, float t, vec3 rd)
{
    vec3 orig = vec3(0.0,0.0,0.0);
    float didHitTerrain = cubes_castRay(ro, rd, orig);
    if(didHitTerrain < cubes_maxStep){
        vec3 nml = cubes_normal(orig);
        vec3 colToRtn = abs(nml) * 0.6;
        float fogval = exp(-pow(1.8*didHitTerrain/cubes_maxStep, 2.0));

        return mix(vec3(0.5, 0.6, 0.7), colToRtn, fogval);
    }
    else{
        return vec3(0.5, 0.6, 0.7);
    }
}

vec3 mandelbulb_mb(vec3 p) {
    p.xyz = p.xzy;
    vec3 z = p;
    vec3 dz=vec3(0.0);
    float power = 8.0;
    float r, theta, phi;
    float dr = 1.0;

    float t0 = 1.0;

    for(int i = 0; i < 7; ++i) {
        r = length(z);
        if(r > 2.0) continue;
        theta = atan(z.y / z.x);
        phi = asin(z.z / r);

        dr = pow(r, power - 1.0) * dr * power + 1.0;

        r = pow(r, power);
        theta = theta * power;
        phi = phi * power;

        z = r * vec3(cos(theta)*cos(phi), sin(theta)*cos(phi), sin(phi)) + p;

        t0 = min(t0, r);
    }
    return vec3(0.5 * log(r) * r / dr, t0, 0.0);
}

float mandelbulb_softshadow(vec3 ro, vec3 rd, float k){
     float akuma=1.0,h=0.0;
     float t = 0.01;
     for(int i=0; i < 50; ++i){
         h=mandelbulb_mb(ro+rd*t).x;
         if(h<0.001)return 0.02;
         akuma=min(akuma, k*h/t);
         t+=clamp(h,0.01,2.0);
     }
     return akuma;
 }

vec3 mandelbulb_nor(in vec3 pos)
{
    vec3 eps = vec3(0.001,0.0,0.0);
    return normalize( vec3(
           mandelbulb_mb(pos+eps.xyy).x - mandelbulb_mb(pos-eps.xyy).x,
           mandelbulb_mb(pos+eps.yxy).x - mandelbulb_mb(pos-eps.yxy).x,
           mandelbulb_mb(pos+eps.yyx).x - mandelbulb_mb(pos-eps.yyx).x ) );
}

vec3 mandelbulb_intersect(in vec3 ro, in vec3 rd)
{
    float t = 1.0;
    float res_t = 0.0;
    float res_d = 1000.0;
    vec3 c, res_c;
    float max_error = 1000.0;
    float d = 1.0;
    float pd = 100.0;
    float os = 1.0;
    float step = 0.0;
    float error = 1000.0;

    for( int i=0; i<48; i++ )
    {
        if( error < 0.0001 * 0.5 || t > 20.0 )
        {
        }
        else{  // avoid broken shader on windows

            c = mandelbulb_mb(ro + rd*t);
            d = c.x;

            if(d > os)
            {
                os = 0.4 * d*d/pd;
                step = d + os;
                pd = d;
            }
            else
            {
                step =-os; os = 0.0; pd = 100.0; d = 1.0;
            }

            error = d / t;

            if(error < max_error)
            {
                max_error = error;
                res_t = t;
                res_c = c;
            }

            t += step;
        }

    }
    if( t>20.0 ) res_t=-1.0;
    return vec3(res_t, res_c.yz);
}

vec3 mandelbulb(vec3 ro, float t, vec3 rd)
{
    ro = vec3(0.5*cos(iGlobalTime), 0.5*sin(iGlobalTime), ro.z - 1.5);
    vec3 res = mandelbulb_intersect(ro, rd);
    vec3 sundir = normalize(vec3(0.1, 0.8, 0.6));
    vec3 sun = vec3(1.64, 1.27, 0.99);
    vec3 skycolor = vec3(0.6, 1.5, 1.0);
    vec3 bg = exp(ro.y-2.0)*vec3(0.4, 1.6, 1.0);
    float halo=clamp(dot(normalize(vec3(-ro.x, -ro.y, -ro.z)), rd), 0.0, 1.0);
    vec3 col=bg+vec3(1.0,0.8,0.4)*pow(halo,17.0);
     if(res.x > 0.0){
           vec3 p = ro + res.x * rd;
           vec3 n=mandelbulb_nor(p);
           float shadow = mandelbulb_softshadow(p, sundir, 10.0 );

           float dif = max(0.0, dot(n, sundir));
           float sky = 0.6 + 0.4 * max(0.0, dot(n, vec3(0.0, 1.0, 0.0)));
           float bac = max(0.3 + 0.7 * dot(vec3(-sundir.x, -1.0, -sundir.z), n), 0.0);
           float spe = max(0.0, pow(clamp(dot(sundir, reflect(rd, n)), 0.0, 1.0), 10.0));

           vec3 lin = 4.5 * sun * dif * shadow;
           lin += 0.8 * bac * sun;
           lin += 0.6 * sky * skycolor;
           lin += 3.0 * spe;

           res.y = pow(clamp(res.y, 0.0, 1.0), 0.55);
           vec3 tc0 = 0.5 + 0.5 * sin(3.0 + 4.2 * res.y + vec3(0.0, 0.5, 1.0));
           col = lin *vec3(0.9, 0.8, 0.6) *  0.2 * tc0;
           col=mix(col,bg, 1.0-exp(-0.001*res.x*res.x));
    }
    return col;
}

vec4 hell_map( vec3 p )
{
    float den = 0.2 - p.y;

    // invert space
    p = -7.0*p/dot(p,p);

    // twist space
    float co = cos(den - 0.25*iGlobalTime);
    float si = sin(den - 0.25*iGlobalTime);
    p.xz = mat2(co,-si,si,co)*p.xz;

    // smoke
    float f;
    vec3 q = p                          - vec3(0.0,1.0,0.0)*iGlobalTime;;
    f  = 0.50000*noise( q ); q = q*2.02 - vec3(0.0,1.0,0.0)*iGlobalTime;
    f += 0.25000*noise( q ); q = q*2.03 - vec3(0.0,1.0,0.0)*iGlobalTime;
    f += 0.12500*noise( q ); q = q*2.01 - vec3(0.0,1.0,0.0)*iGlobalTime;
    f += 0.06250*noise( q ); q = q*2.02 - vec3(0.0,1.0,0.0)*iGlobalTime;
    f += 0.03125*noise( q );

    den = clamp( den + 4.0*f, 0.0, 1.0 );

    vec3 col = mix( vec3(1.0,0.9,0.8), vec3(0.4,0.15,0.1), den ) + 0.05*sin(p);

    return vec4( col, den );
}

vec3 hell(vec3 rd_orig)
{
    vec2 q = gl_FragCoord.xy / iResolution.xy;
    vec2 p = -1.0 + 2.0*q;
    p.x *= iResolution.x/ iResolution.y;

    vec3 ro = 4.0*normalize(vec3(1.0, 1.4 - 1.0*(-.1), 0.0));
    vec3 ta = vec3(0.0, 0.0, 0.0);
    float cr = 0.5*cos(0.7*iGlobalTime);

    // build ray
    vec3 ww = normalize( ta - ro);
    vec3 uu = normalize(cross( vec3(sin(cr),cos(cr),0.0), ww ));
    vec3 vv = normalize(cross(ww,uu));
    vec3 rd = normalize( p.x*uu + p.y*vv + 2.0*ww );

    vec4 sum = vec4( 0.0 );

    float t = 0.0;

    for( int i=0; i<100; i++ )
    {
        if( sum.a > 0.99 ) break;

        vec3 pos = ro + t*rd;
        vec4 col = hell_map( pos );

        col.xyz *= mix( 3.1*vec3(1.0,0.5,0.05), vec3(0.48,0.53,0.5), clamp( (pos.y-0.2)/2.0, 0.0, 1.0 ) );

        col.a *= 0.6;
        col.rgb *= col.a;

        sum = sum + col*(1.0 - sum.a);

        t += 0.05;
    }

    vec3 col = clamp( sum.xyz, 0.0, 1.0 );
    col = col*0.5 + 0.5*col*col*(3.0-2.0*col);
    col *= 0.25 + 0.75*pow( 16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.1 );
    return col;
}

vec3 scene(vec3 ro, float t, vec3 rd)
{
    int level = int(mod(round(height) / (6. * FLOOR_HEIGHT), 3.));

    switch (level)
    {
    case 0:
      return cubes(ro, t, rd);
    case 1:
      return mandelbulb(ro, t, rd);
    case 2:
      return hell(rd);
    }
}

vec3 texMarble(vec3 p)
{
    vec3 vain = texStain(vec3(p.xz * 5., 1.0), vec3(0.1, 0.05, 0.05), vec3(1.0, 1.0, 0.9), 2);
    float s = min(smoothstep(0.0, 0.02, mod(-p.z, 0.5)), smoothstep(0.0, 0.02,
    mod(p.z, 0.5)));
    s = min(s, min(smoothstep(0.0, 0.02, mod(-p.x, 0.5)), smoothstep(0.0, 0.02,
    mod(p.x, 0.5))));
    s = clamp(s + 0.5, 0.0, 1.0);
    return s * vain;
}

vec3 texConcrete(vec3 p, vec3 n)
{
    vec3 coef = abs(p) * (1.0 - abs(n));
    vec2 uv = vec2(max(coef.x, coef.z), coef.y);
    vec3 grey = mix(texStain(vec3(uv * 10., 1.0), vec3(0.6), vec3(0.4), 64),
    vec3(noise(uv * 100.)), 0.3);
    vec3 res = grey * 0.2 + 0.5;
    if (p.z > 1.57)
    {
        p.y = mod(p.y + FLOOR_HEIGHT, 2. * FLOOR_HEIGHT) - FLOOR_HEIGHT;
        if (abs(p.y) < ELEVATOR_HEIGHT - BEAM_THICKNESS - 0.01)
          res = vec3(0.4);
        if (p.z > 1.58 && abs(p.y) < ELEVATOR_HEIGHT - BEAM_THICKNESS - 0.02)
          res = smoothstep(0.005, 0.01, abs(p.x)) * vec3(0.4) + vec3(0.4);
    }
    return res;
}

vec3 metalNormal(vec3 p, vec3 n)
{
    vec3 disp = vec3(noise(n.yz), noise(n.xz), noise(n.xy));
    return mix(0.1 * disp, 0.3 * disp,
            (fbm(floor(300.*(p.xy+p.yz))) + 1.0) / 2.0);
}

vec3 getNormalMap(vec3 p, vec3 n, int id)
{
    switch (id)
    {
        case METAL_ID:
        case STRUCT_ID:
            return metalNormal(p - vec3(0.0, height, 0.0), n);
        case BEAM_ID:
            return metalNormal(p, n);
        default:
          return vec3(0.);
    }
}

vec3 getMaterial(vec3 ro, float t, vec3 rd, int id, inout vec3 n, out float transparency)
{   
    vec3 p = ro + t * rd;
    transparency = mod(id, 16) / 15.0;
    vec3 ret = vec3(0.0);
    switch (id)
    {
        case WALL_ID:
            ret = texConcrete(p, n);
            break;
        case BEAM_ID:
            ret = vec3(0.25);
            break;
        case STRUCT_ID:
            ret = vec3(0.8);
            break;
        case METAL_ID:
            ret = vec3(0.6);
            break;
        case CABLE_ID:
            ret = vec3(0.2);
            break;
        case WINDOW_ID:
            vec3 ns = abs(n);
            if (ns.y > max(ns.x, ns.z))
            { // floor or ceiling
                transparency = 0.0;
                if (n.y > 0.0 && p.y < height) // floor
                {
                    ret = texMarble(p);
                    break;
                }
                else
                {
                    id = STRUCT_ID;
                    ret = vec3(0.8);
                }
            }
            else
                ret = vec3(0.1, 0.2, 0.5);
            break;
        case SCENE_ID:
            ret = scene(ro, t, rd);
            break;
        case GROUND_ID:
        default:
            ret = vec3(0.0);
            break;
    }
    n += getNormalMap(p, n, id);
    normalize(n);
    return ret;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 pa = p - a;
    vec3 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

float sphere(vec3 p, float r)
{
    return length(p) - r;
}

float plane(vec3 p, vec4 n)
{
    return dot(p, n.xyz) + n.w;
}

float roundBox(vec3 p, vec3 b, float r)
{
    return length(max(abs(p) - b, 0.0)) - r;
}

float smin(float a, float b, float k)
{
    a = pow(a, k); b = pow(b, k);
    return pow((a * b) / (a + b), 1.0 / k);
}

float cylinder(vec3 p, vec2 h)
{
    vec2 d = abs(vec2(length(p.xz), p.y)) - h;
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float hcylinder(vec3 p, vec2 h)
{
    vec2 d = abs(vec2(length(p.xy), p.z)) - h;
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float vInfCylinder(vec3 p, float r)
{
    return length(p.xz) - r;
}

float semiVInfCylinder(vec3 p, float r, float h)
{
    return (length(p.xz) - r) - min(p.y - h, 0.0);
}
float box(vec3 p, vec3 b)
{
    return length(max(abs(p) - b, 0.0));
}

float sBox(vec3 p, vec3 b)
{
    vec3 d = abs(p) - b;
    return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float hollowedCylinder(vec3 p, vec2 h, float thickness)
{
    return max(cylinder(p, h), -cylinder(p, vec2(h.x - thickness * 2.0, h.y + 0.2)));
}

float moonQuarter(vec3 p, vec2 h, float thickness)
{
    return max(hollowedCylinder(p, h, thickness),
        box(p - vec3(0.0, 0.0, h.x * 0.5), vec3(1.0, h.y + 0.1, h.x * 0.5 + 0.1)));
}

float vBeam(vec3 p, float l)
{
    return min(box(p, vec3(BEAM_WIDTH, l, BEAM_THICKNESS)),
        min(box(p - vec3(BEAM_WIDTH, 0.0, 0.0), vec3(BEAM_THICKNESS, l, BEAM_WIDTH)),
                box(p - vec3(-BEAM_WIDTH, 0.0, 0.0), vec3(BEAM_THICKNESS, l, BEAM_WIDTH))));
}

float hBeam(vec3 p, float l)
{
    return min(box(p, vec3(BEAM_WIDTH, BEAM_THICKNESS, l)),
        min(box(p - vec3(BEAM_WIDTH, 0.0, 0.0), vec3(BEAM_THICKNESS, BEAM_WIDTH, l)),
                box(p - vec3(-BEAM_WIDTH, 0.0, 0.0), vec3(BEAM_THICKNESS, BEAM_WIDTH, l))));
}

float curvedHBeam(vec3 p)
{
    return max(min(hollowedCylinder(p, vec2(1.0 - WALL_THICKNESS, BEAM_WIDTH), BEAM_THICKNESS),
            max(min(cylinder(p, vec2(1.0 - WALL_THICKNESS, BEAM_THICKNESS)),
            cylinder(p, vec2(1.0 - WALL_THICKNESS - BEAM_WIDTH * 2.0, BEAM_WIDTH))),
            -cylinder(p, vec2(1.0 - WALL_THICKNESS - BEAM_WIDTH * 2.0 - BEAM_THICKNESS * 2.0, BEAM_WIDTH + 0.2)))),
            box(p - vec3(0.0, 0.0, (1.0 - WALL_THICKNESS) * 0.5), vec3(1.0, BEAM_WIDTH + 0.1, (1.0 - WALL_THICKNESS) * 0.5)));
}

float beams(vec3 p)
{
    float b1 = vBeam(p - vec3(-1.0 + BEAM_WIDTH + WALL_THICKNESS + BEAM_THICKNESS, 0.0, 0.7), FLOOR_HEIGHT);
    float b2 = vBeam(p - vec3(-1.0 + BEAM_WIDTH + WALL_THICKNESS + BEAM_THICKNESS, 0.0, -0.7), FLOOR_HEIGHT);
    float b3 = vBeam(p - vec3(1.0 - BEAM_WIDTH - WALL_THICKNESS - BEAM_THICKNESS, 0.0, 0.7), FLOOR_HEIGHT);
    float b4 = vBeam(p - vec3(1.0 - BEAM_WIDTH - WALL_THICKNESS - BEAM_THICKNESS, 0.0, -0.7), FLOOR_HEIGHT);

    float b5 = hBeam(p - vec3(-1.0 + BEAM_WIDTH + WALL_THICKNESS + BEAM_THICKNESS, H_BEAM_HEIGTH, 0.15), 0.85);
    float b6 = hBeam(p - vec3(1.0 - BEAM_WIDTH - WALL_THICKNESS - BEAM_THICKNESS, H_BEAM_HEIGTH, 0.15), 0.85);
    float b7 = curvedHBeam(p - vec3(0.0, H_BEAM_HEIGTH, 1.0));

    float b8 = vBeam(p - vec3(-0.7, 0.0, -1.0 + BEAM_WIDTH + WALL_THICKNESS), FLOOR_HEIGHT);
    float b9 = vBeam(p - vec3(0.7, 0.0, -1.0 + BEAM_WIDTH + WALL_THICKNESS), FLOOR_HEIGHT);

    float c = cos(0.45);
    float s = sin(0.45);
    vec3 q = vec3(c * p.x + s * p.y, - s * p.x + c * p.y, p.z);
    float b10 = cylinder(q - vec3(0.0, 0.0, -1.0 + BEAM_WIDTH + WALL_THICKNESS), vec2(WALL_THICKNESS, FLOOR_HEIGHT));
    q = vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
    float b11 = cylinder(q - vec3(0.0, 0.0, -1.0 + BEAM_WIDTH + WALL_THICKNESS), vec2(WALL_THICKNESS, FLOOR_HEIGHT));

    c = cos(PI_4);
    s = sin(PI_4);
    q = p - vec3(-0.85 + (WALL_THICKNESS + BEAM_WIDTH + BEAM_THICKNESS) * 0.5, H_BEAM_HEIGTH, -0.85 + (WALL_THICKNESS + BEAM_WIDTH) * 0.5);
    q = vec3(c * q.x + s * q.z, q.y, - s * q.x + c * q.z);
    float b12 = hBeam(q, 0.15);
    q = p - vec3(0.85 - (WALL_THICKNESS + BEAM_WIDTH + BEAM_THICKNESS) * 0.5, H_BEAM_HEIGTH, -0.85 + (WALL_THICKNESS + BEAM_WIDTH) * 0.5);
    q = vec3(c * q.x - s * q.z, q.y, s * q.x + c * q.z);
    float b13 = hBeam(q, 0.15);

    return min(b1, min(b2, min(b3, min(b4, min(b5, min(b6, min(b7, min(b8,
            min(b9, min(b10, min (b11, min(b12, b13))))))))))));
}

float cables(vec3 p)
{
    float c1 = vInfCylinder(p - vec3(0.1, 0.0, -0.8), 0.01);
    float c2 = vInfCylinder(p - vec3(-0.1, 0.0, -0.8), 0.01);
    return min(c1, c2);
}

vec2 elevatorShaft(vec3 p)
{
    vec3 q = vec3(p.x, mod(p.y + FLOOR_HEIGHT, FLOOR_HEIGHT * 2.0) -
    FLOOR_HEIGHT, p.z);
    //q = p;
    float b1 = box(q, vec3(1.0, FLOOR_HEIGHT, 1.0));
    float c1 = cylinder(q - vec3(0.0, 0.0, 1.0), vec2(1.0, FLOOR_HEIGHT));

    float b2 = sBox(q - vec3(0.0, 0.0, WALL_THICKNESS), vec3(1.0 - WALL_THICKNESS, FLOOR_HEIGHT + 0.2, 1.0));
    float c2 = cylinder(q - vec3(0.0, 0.0, 1.0), vec2(1.0 - WALL_THICKNESS, FLOOR_HEIGHT + 0.2));

    vec2 walls = vec2(WALL_ID, max(min(b1, c1), -min(b2, c2)));

    vec2 beams = vec2(BEAM_ID, beams(q));

    vec2 cables = vec2(CABLE_ID, cables(p));

    vec2 ret = (walls.y < beams.y) ? walls : beams;
    ret = (ret.y < cables.y) ? ret : cables;

    return ret;
}

vec2 elevator(vec3 p, float h)
{
    float b1 = box(p - vec3(0.0, h, 0.2), vec3(0.8, ELEVATOR_HEIGHT, 0.8));
    float c1 = cylinder(p - vec3(0.0, h, 1.0), vec2(0.8, ELEVATOR_HEIGHT));

    float b2 = sBox(p - vec3(0.0, h, 0.2 + BEAM_THICKNESS), vec3(0.8 - BEAM_THICKNESS,
            ELEVATOR_HEIGHT - BEAM_THICKNESS, 0.8));
    float c2 = cylinder(p - vec3(0.0, h, 1.0), vec2(0.8 - BEAM_THICKNESS, ELEVATOR_HEIGHT -
            BEAM_THICKNESS));
    float ceiling = roundBox(p - vec3(0.0, h + ELEVATOR_HEIGHT - 0.45, 0.0), vec3(0.42), 0.08);

    float hole = sBox(p - vec3(0.0, h + ELEVATOR_HEIGHT, 0.0), vec3(0.4));

    float s1 = cylinder(p - vec3(0.8 - WALL_THICKNESS * 0.5, h, 1.0 - WALL_THICKNESS * 0.5), vec2(WALL_THICKNESS, ELEVATOR_HEIGHT));
    float s2 = cylinder(p - vec3(0.8 - WALL_THICKNESS * 0.5, h, -0.6 + WALL_THICKNESS * 0.5), vec2(WALL_THICKNESS, ELEVATOR_HEIGHT));
    float s3 = cylinder(p - vec3(-0.8 + WALL_THICKNESS * 0.5, h, 1.0 - WALL_THICKNESS * 0.5), vec2(WALL_THICKNESS, ELEVATOR_HEIGHT));
    float s4 = cylinder(p - vec3(-0.8 + WALL_THICKNESS * 0.5, h, -0.6 + WALL_THICKNESS * 0.5), vec2(WALL_THICKNESS, ELEVATOR_HEIGHT));

    float b3 = box(p - vec3(0.8 - BEAM_THICKNESS * 0.5, h, 0.3), vec3(WALL_THICKNESS, ELEVATOR_HEIGHT - BEAM_THICKNESS, 0.2));
    float b4 = box(p - vec3(0.8 - WALL_THICKNESS * 2.0, h - 0.2, 0.3), vec3(WALL_THICKNESS, WALL_THICKNESS, 0.15));
    float c3 = hcylinder(p - vec3(0.8 - WALL_THICKNESS * 3.0, h - 0.2, 0.2), vec2(WALL_THICKNESS, 0.7));

    float c4 = semiVInfCylinder(p - vec3(0.6, 0.0, -0.2), 0.01, h + ELEVATOR_HEIGHT);
    float c5 = semiVInfCylinder(p - vec3(-0.6, 0.0, -0.2), 0.01, h + ELEVATOR_HEIGHT);
    float c6 = semiVInfCylinder(p - vec3(0.6, 0.0, 0.7), 0.01, h + ELEVATOR_HEIGHT);
    float c7 = semiVInfCylinder(p - vec3(-0.6, 0.0, 0.7), 0.01, h + ELEVATOR_HEIGHT);

    vec2 walls = vec2(WINDOW_ID, max(-hole, max(-min(b2, c2), min(b1, c1))));
    vec2 structure = vec2(METAL_ID, min(s1, min(s2, min(s3, s4))));
    vec2 trapBorder = vec2(STRUCT_ID, max(-min(hole, b2), ceiling));

    vec2 panel = vec2(METAL_ID, min(b3, min(b4, c3)));

    vec2 cables = vec2(CABLE_ID, min(c4, min(c5, min(c6, c7))));

    vec2 ret = (walls.y < structure.y) ? walls : structure;
    ret = (ret.y < panel.y) ? ret : panel;
    ret = (ret.y < trapBorder.y) ? ret : trapBorder;
    ret = (ret.y < cables.y) ? ret : cables;

    return ret;
}

vec2 map(vec3 p)
{
    vec2 elevatorShaft = elevatorShaft(p);
    vec2 elevator = elevator(p, height);
    vec2 scene = vec2(SCENE_ID, box(p - vec3(0.0, height, ELEVATOR_HEIGHT * 4 + 2.5), vec3(ELEVATOR_HEIGHT * 4)));

    float z = sin((iGlobalTime - 4.) * PI / 10.);
    vec2 doorWay = vec2(DOORWAY_ID, sBox(p - vec3(0.0, height, 3.1 + z),
            vec3(0.8 - BEAM_THICKNESS, ELEVATOR_HEIGHT - BEAM_THICKNESS - 0.01, 1.0 - WALL_THICKNESS)));

    vec2 ret = (elevator.y < elevatorShaft.y) ? elevator : elevatorShaft;
    ret = (ret.y > -doorWay.y) ? ret : -doorWay;
    ret = (ret.y < scene.y) ? ret : scene;

    return ret;
}

vec3 normal(vec3 p, int id)
{
    vec2 e = vec2(0.0001, 0.0);
    return normalize(vec3(map(p + e.xyy).y - map(p - e.xyy).y,
                          map(p + e.yxy).y - map(p - e.yxy).y,
                          map(p + e.yyx).y - map(p - e.yyx).y));
}

void animate(inout vec3 ro, inout vec3 ta)
{
    ro.x = sin(iGlobalTime * SPEED) * 0.5;
    ro.y = height;
    ro.z = 0.0;

    ta.x = 0.2;
    ta.y = height + sin((max(fract((iGlobalTime) / 40. - 0.4) * 4./3., 1) - 1.) * 3. * PI);
    ta.z = 0.8;
}

float softshadow(in vec3 ro, in vec3 rd, in float tmin, in float tmax)
{
    float res = 1.0;
    float t = tmin;
    float transparency;
    for (int i = 0; i < 16; i++)
    {
        vec2 h = map(ro + rd * t);
        if ((transparency = mod(int(h.x), 16) / 15.0)  > 0.0)
        {
                t += DETAIL;
                continue;
        }
        res = min(res, 8.0 * h.y / t);
        t += clamp(h.y, 0.02, 0.10);
        if(h.y < 0.001 || t > tmax)
            break;
    }
    return clamp(res, 0.0, 1.0);

}

vec3 ray_marching(inout float t, vec3 ro, vec3 rd, out float transparency)
{
    transparency = 0.0;
    vec2 res = vec2(-1.0, 1.0);
    for (int i = 0; i < MAXSTEP; i++)
    {
        if (res.y < DETAIL || t > FAR)
            break;
        res = map(ro + t * rd);
        t += res.y;
    }

    // do not intersect an object (far clip)
    if (t > FAR)
        return vec3(0.5, 0.6, 0.7);

    vec3 pos = ro + t * rd;
    vec3 n = normal(pos, int(res.x));
    vec3 ref = reflect(rd, n);

#ifdef TEXTURE
    vec3 col = getMaterial(ro, t, rd, int(res.x), n, transparency);
#else
    vec3 col = vec3(0.5);
#endif

    // Lights and shadows
#ifdef LIGHT
    if (res.x != SCENE_ID)
    {
        vec3 light = vec3(0.0, height + ELEVATOR_HEIGHT - 0.1, 0.0);
        vec3 lightDir = normalize(light - pos);
        float amb = 0.1;
        float dif = clamp(dot(n, lightDir), 0.0, 1.0);
        float spe = pow(clamp(dot(ref, lightDir), 0.0, 1.0), 32.0);

# ifdef SHADOWS
        float sha = softshadow(pos, lightDir, 0.02, length(light - pos));
# else
        float sha = 1.0;
# endif

        vec3 lcol = vec3(1.0, 0.9, 0.6);
        vec3 lig = sha * dif * lcol * (1.0 + 2.0 * spe) + amb;
        col *= lig;
    }
#endif

    return col;
}

vec3 ray_marching2(inout float t, vec3 ro, vec3 rd)
{
    float transparency = 0.0;
    vec2 res = vec2(-1.0, 1.0);
    for (int i = 0; i < MAXSTEP; i++)
    {
        res = map(ro + t * rd);
        t += res.y;
        if (res.y < DETAIL && mod(int(res.x), 16) > 0)
        {
            t += 0.008;
            continue;
        }
        if (res.y < DETAIL || t > FAR)
            break;
    }

    // do not intersect an object (far clip)
    if (t > FAR)
        return vec3(0.5, 0.6, 0.7);

    vec3 pos = ro + t * rd;
    vec3 n = normal(pos, int(res.x));
    vec3 ref = reflect(rd, n);

#ifdef TEXTURE
    vec3 col = getMaterial(ro, t, rd, int(res.x), n, transparency);
#else
    vec3 col = vec3(0.5);
#endif

    // Lights and shadows
#ifdef LIGHT
    if (res.x != SCENE_ID)
    {
        vec3 light = vec3(0.0, 1.0 + height, 0.0);
        vec3 lightDir = normalize(light - pos);
        float amb = 0.1;
        float dif = clamp(dot(n, lightDir), 0.0, 1.0);
        float spe = pow(clamp(dot(ref, lightDir), 0.0, 1.0), 32.0);

# ifdef SHADOWS
        float sha = softshadow(pos, lightDir, 0.02, length(light - pos));
# else
        float sha = 1.0;
# endif

        vec3 lcol = vec3(1.0, 0.9, 0.6);
        vec3 lig = sha * dif * lcol * (1.0 + 2.0 * spe) + amb;
        col *= lig;
    }
#endif

    return col;
}

void main()
{
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 p = -1.0 + 2.0 * uv;
    p.x *= iResolution.x / iResolution.y;

#ifdef FPSCOUNT
    float c = FPSDisplay(gl_FragCoord.xy / 5.);
    if (c > 0.)
    {
        fragColor = vec3(0.1, 1.0, 0.2);
        return;
    }
#endif

    float t = iGlobalTime / 20.;
    height = 6.0 * FLOOR_HEIGHT * (0.5 * (tanh(10.0 * (fract(t) - 0.5)) + 1.) + floor(t));

    // Camera
    vec3 ro = vec3(0.0);
    vec3 ta = vec3(0.0);
    animate(ro, ta);
    vec3 cf = normalize(ta - ro);
    vec3 cr = normalize(cross(cf, vec3(0.0, 1.0, 0.0)));
    vec3 cu = normalize(cross(cr, cf));
    vec3 rd = normalize(p.x * cr + p.y * cu + 1.0 * cf);

    t = 0.0;
    float transparency;
    vec3 col = ray_marching(t, ro, rd, transparency);

#ifdef TEXTURE
# ifdef TRANSPARENCY
    vec3 pos = ro + t * rd;
    if (transparency > 0.0)
    {
        vec3 second_col = ray_marching2(t, ro, rd);
        col = mix(col, second_col, transparency);
    }
# endif
#endif

    // Fog
    float fogval = exp(-pow(1.8*length(t * rd)/FAR, 2.0));

    fragColor = mix(vec3(0.5, 0.6, 0.7), col, fogval);
}
