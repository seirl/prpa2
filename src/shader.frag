#version 330 core

out vec3 fragColor;

uniform vec2 iResolution;
uniform float iGlobalTime;

#define MAXSTEP 45.0
#define SPEED   1.0
#define DIST    9.0

#define WALL_THICKNESS  0.02
#define BEAM_THICKNESS  0.01
#define BEAM_WIDTH      0.05
#define FLOOR_HEIGHT    1.5

#define B_WALL_ID 1
#define R_WALL_ID 2
#define L_WALL_ID 3
#define F_WALL_ID 4
#define BEAM_ID 4

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

mat2 m2 = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(in vec2 p)
{
    float z =2.0;
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

vec3 texBloodOnTable(vec3 p)
{
    return mix(vec3(1.0, 0.0, 0.0), vec3(0.25, 0.1, 0.2) * 0.5, smoothstep(0.2,
    0.8, pow(fbm(p.xy), 2)));
}

vec3 getMaterial(vec3 p, float id)
{
    switch (int(id))
    {
        case B_WALL_ID:
            return texBloodOnTable(p);
        case R_WALL_ID:
            return vec3(0.8, 0.8, 0.1);
        case L_WALL_ID:
            return vec3(0.0, 0.5, 0.0);
        case F_WALL_ID:
            return vec3(0.1, 0.2, 0.4);
        default:
            return vec3(0.2, 0.3, 0.8);
    }
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

float box(vec3 p, vec3 b)
{
    return length(max(abs(p) - b, 0.0));
}

float moonQuarter(vec3 p, vec2 h)
{
    return max(max(cylinder(p, h),
        - cylinder(p,  vec2(h.x - WALL_THICKNESS * 2.0, h.y + 0.001))),
        box(p - vec3(0.0, 0.0, h.x / 2.0), vec3(1.0, h.y + 0.001, h.x / 2.0)));
}

float beam(vec3 p)
{
    return min(box(p, vec3(BEAM_WIDTH, FLOOR_HEIGHT, BEAM_THICKNESS)),
        min(box(p - vec3(BEAM_WIDTH, 0.0, 0.0), vec3(BEAM_THICKNESS, FLOOR_HEIGHT, BEAM_WIDTH)),
        box(p - vec3(-BEAM_WIDTH, 0.0, 0.0), vec3(BEAM_THICKNESS, FLOOR_HEIGHT, BEAM_WIDTH))));
}

float beams(vec3 p)
{
    float b1 = beam(p - vec3(-1.0 + BEAM_WIDTH + WALL_THICKNESS + BEAM_THICKNESS, 0.0, 0.7));
    float b2 = beam(p - vec3(-1.0 + BEAM_WIDTH + WALL_THICKNESS + BEAM_THICKNESS, 0.0, -0.7));
    float b3 = beam(p - vec3(1.0 - BEAM_WIDTH - WALL_THICKNESS - BEAM_THICKNESS, 0.0, 0.7));
    float b4 = beam(p - vec3(1.0 - BEAM_WIDTH - WALL_THICKNESS - BEAM_THICKNESS, 0.0, -0.7));

    return min(b1, min(b2, min(b3, b4)));
}

vec2 elevatorShaft(vec3 p)
{
    vec3 q = vec3(p.x, mod(p.y + FLOOR_HEIGHT, FLOOR_HEIGHT * 2) - FLOOR_HEIGHT, p.z);
    q = p;

    vec2 bwall = vec2(B_WALL_ID,  box(q - vec3(0.0, 0.0, -1.0),
        vec3(1.0, FLOOR_HEIGHT, WALL_THICKNESS)));
    vec2 rwall = vec2(R_WALL_ID, box(q - vec3(-1.0, 0.0, 0.0),
        vec3(WALL_THICKNESS, FLOOR_HEIGHT, 1.0)));
    vec2 lwall = vec2(L_WALL_ID, box(q - vec3(1.0, 0.0, 0.0),
        vec3(WALL_THICKNESS, FLOOR_HEIGHT, 1.0)));
    vec2 fwall = vec2(F_WALL_ID, moonQuarter(q - vec3(0.0, 0.0, 1.0),
        vec2(1.0, FLOOR_HEIGHT)));
    vec2 beams = vec2(BEAM_ID, beams(q));

    vec2 ret = (bwall.y < rwall.y) ? bwall : rwall;
    ret = (ret.y < lwall.y) ? ret : lwall;
    ret = (ret.y < fwall.y) ? ret : fwall;
    ret = (ret.y < beams.y) ? ret : beams;

    return ret;
}

vec2 map(vec3 p)
{
    vec2 ground = vec2(0, plane(p - vec3(0.0, -2.0, 0.0), vec4(0.0, 1.0, 0.0, 0.0)));
    vec2 elevatorShaft = elevatorShaft(p);

    vec2 ret = (ground.y < elevatorShaft.y) ? ground : elevatorShaft;

    return ret;
}

vec3 normal(vec3 p)
{
    vec2 e = vec2(0.0001, 0.0);
    return normalize(vec3(map(p + e.xyy).y - map(p - e.xyy).y,
                           map(p + e.yxy).y - map(p - e.yxy).y,
                           map(p + e.yyx).y - map(p - e.yyx).y));
}

void animate(inout vec3 ro, inout vec3 ta)
{
    float h = 3.0;
    ro.y = h;
    ro.x = sin(iGlobalTime * SPEED) * 6.0;
    ta.y = h - 3.0;
    ro.z = cos(iGlobalTime * SPEED) * 6.0;
}

void main()
{
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 p = -1.0 + 2.0 * uv;
    p.x *= iResolution.x / iResolution.y;
    
    // Camera
    vec3 ro = vec3(6.0);
    vec3 ta = vec3(0.0);
    animate(ro, ta);
    vec3 cf = normalize(ta - ro);
    vec3 cr = normalize(cross(cf, vec3(0.0, 1.0, 0.0)));
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
    
    // intersect an object
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
