#version 330 core

out vec3 fragColor;

uniform vec2 iResolution;
uniform float iGlobalTime;

#define MAXSTEP 45.0
#define SPEED 1.0
#define DIST 9.0

#define BOX_ID 42
#define SPHERE_ID 5

float noise(in vec2 p)
{
    vec2 f = fract(p);
    p = floor(p);
    float v = p.x+p.y*1000.0;
    vec4 r = vec4(v, v+1.0, v+1000.0, v+1001.0);
    r = fract(100000.0*sin(r*.001));
    f = f*f*(3.0-2.0*f);
    return 2.0*(mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y))-1.0;
}

mat2 m2 = mat2( 0.80,  0.60, -0.60,  0.80 );

float fbm(in vec2 p)
{
    float z=2.;
    float rz = 0.;
    for (float i= 1.;i < 7.;i++ )
    {
        rz+= abs((noise(p)-0.5)*2.)/z;
        z = z*2.;
        p = p*2.;
        p*= m2;
    }
    return rz;
}

vec3 texBloodOnTable(vec3 p)
{
    return mix(vec3(1.0, 0.0, 0.0), vec3(0.25, 0.1, 0.2) * 0.5, smoothstep(0.2, 0.8, fbm(p.xz)));
}

vec3 getMaterial(vec3 p, float id)
{
    switch (int(id))
    {
        case BOX_ID:
            return texBloodOnTable(p);
        default:
            return vec3(0.2, 0.3, 0.8);
    }
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 pa = p - a;
    vec3 ba = b - a;
    float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
    return length(pa - ba*h) - r;
}

float sphere(vec3 p, float r)
{
    return length(p) - r;
}

float roundBox(vec3 p, vec3 b, float r)
{
    return length(max(abs(p)-b,0.0))-r;
}

float smin(float a, float b, float k)
{
    a = pow(a, k); b = pow(b, k);
    return pow((a*b)/(a+b), 1.0/k);
}

vec2 map(vec3 p)
{
    vec2 d1 = vec2(BOX_ID, roundBox(p, vec3(2.0, 0.1, 5.0), 0.2));
    vec2 d2 = vec2(SPHERE_ID, sphere(p - vec3(1.0, 2.0 * sin(iGlobalTime), 3.0), 0.5));

    return (d1.y < d2.y) ? d1 : d2;
}

vec3 normal(vec3 p)
{
    vec2 e = vec2(0.0001, 0.0);
    return normalize(vec3(map(p + e.xyy).y - map(p - e.xyy).y,
                           map(p + e.yxy).y - map(p - e.yxy).y,
                           map(p + e.yyx).y - map(p - e.yyx).y));
}

void animate(inout vec3 ro)
{
    ro.x = sin(iGlobalTime * SPEED) * DIST;
    ro.z = cos(iGlobalTime * SPEED) * DIST;
}

void main()
{
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 p = -1.0 + 2.0 * uv;
    p.x *= iResolution.x / iResolution.y;
    
    // Camera
    vec3 ro = vec3(0.0, 2.0, 0.0);
    animate(ro);
    vec3 ta = vec3(0.0, 0.0, 0.0);
    vec3 cf = normalize(ta - ro);
    vec3 cr = normalize(cross(cf, vec3(0.0,1.0,0.0)));
    vec3 cu = normalize(cross(cr, cf));
    vec3 rd = normalize(p.x*cr + p.y*cu + 2.5*cf);
    
    float t = 0.0;
    vec2 res = vec2(-1.0, 1.0);
    for (int i = 0; i < 100; i++)
    {
        if (res.y < 0.0001 || t > MAXSTEP)
            break;
        res = map(ro + t * rd);
        t += res.y;
    }
    
    vec3 light = vec3(0.57735);
    
    // intersect a sphere
    if (t <= MAXSTEP)
    {
        vec3 pos = ro + t * rd;
        vec3 n = normal(pos);
        // Point light
        vec3 col = vec3(0.8) * clamp(dot(n, light), 0.0, 1.0);
        // Directional ligth
        col += vec3(0.2, 0.3, 0.4) * clamp(pos.z, 0.0, 1.0);
        // Ambiant ligth
        col += vec3(0.1);
        
        // Color
        col = mix(col, getMaterial(pos, res.x), 0.9);
        
        // Reflection
        vec3 ref = reflect(rd, n);
        
        // Specular
        float spec = pow(clamp(dot(light, ref), 0.0, 1.0), 16.0);
        col += 1.0 * spec;
        
        fragColor = vec3(col);
    }
    else
        fragColor = vec3(0.0);
}
