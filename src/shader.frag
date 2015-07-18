#version 330 core

uniform vec2 iResolution;
uniform float iGlobalTime;

out vec4 fragColor;

#define MAXSTEP 45.0
#define SPEED 1.0
#define DIST 9.0

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

float map(vec3 p)
{
    float d1 = roundBox(p, vec3(2.0, 0.1, 5.0), 0.2);
    float d2 = sphere(p - vec3(1.0, 2.0 * sin(iGlobalTime), 3.0), 0.5);

    return min(d1, d2);
}

vec3 normal(vec3 p)
{
    vec2 e = vec2(0.0001, 0.0);
    return normalize(vec3(map(p + e.xyy) - map(p - e.xyy),
                           map(p + e.yxy) - map(p - e.yxy),
                           map(p + e.yyx) - map(p - e.yyx)));
}

void animate(inout vec3 ro)
{
    ro.x = sin(iGlobalTime * SPEED) * DIST;
    ro.z = cos(iGlobalTime * SPEED) * DIST;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;
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
    float h = 1.0;
    for (int i = 0; i < 100; i++)
    {
        if (h < 0.0001 || t > MAXSTEP)
            break;
        h = map(ro + t * rd);
        t += h;
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
        col = mix(col, vec3(0.2, 0.3, 0.8), 0.9);
        
        // Reflection
        vec3 ref = reflect(rd, n);
        
        // Specular
        float spec = pow(clamp(dot(light, ref), 0.0, 1.0), 16.0);
        col += 1.0 * spec;
        
        fragColor = vec4(col, 1.0);
    }
    else
        fragColor = vec4(0.0);
}
