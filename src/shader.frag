#version 330 core

out vec3 fragColor;

uniform vec2 iResolution;
uniform float iGlobalTime;

uniform float FPS;

#define MAXSTEP 100.0
#define FAR     45.0
#define SPEED   1.0
#define DIST    9.0

#define PI      3.141592653589793
#define PI_2    1.5707963267948966
#define PI_4    0.7853981633974483

#define WALL_THICKNESS  0.02
#define BEAM_THICKNESS  0.01
#define BEAM_WIDTH      0.05
#define FLOOR_HEIGHT    1.5
#define H_BEAM_HEIGTH   (FLOOR_HEIGHT - BEAM_WIDTH - 0.1)

// Transparancy = mod(id, 16)
#define B_WALL_ID   0x10
#define R_WALL_ID   0x20
#define L_WALL_ID   0x30
#define F_WALL_ID   0x40
#define BEAM_ID     0x50
#define X_WINDOW_ID 0x68
#define Z_WINDOW_ID 0x78

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
    uv -= vec2(1.,10.);
    if ((uv.x < 0.) || (uv.x >= 32.) || (uv.y < 0.) || (uv.y >= 5.))
        return -1.;

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

vec3 texStain(vec3 p, vec3 c1, vec3 c2, float power)
{
    return mix(c1, c2, smoothstep(0.2,
    0.8, pow(fbm(p.xy) * p.z, power)));
}

vec3 getMaterial(vec3 p, float id)
{
    switch (int(floor(id)))
    {
        case B_WALL_ID:
            return texStain(p, vec3(1.0, 0.0, 0.0), vec3(0.125, 0.05, 0.1), 2);
        case R_WALL_ID:
            return vec3(0.8, 0.8, 0.1);
        case L_WALL_ID:
            return vec3(0.0, 0.5, 0.0);
        case F_WALL_ID:
            return vec3(0.1, 0.2, 0.4);
        case BEAM_ID:
            return texStain(p.xzy, vec3(0.4), vec3(0.2), 64);
        case X_WINDOW_ID:
        case Z_WINDOW_ID:
            //return mix(vec3(0.2, 0.3, 0.8), , mod(id, 16) / 15.0);
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

float moonQuarter(vec3 p, vec2 h, float thickness)
{
    return max(max(cylinder(p, h),
        - cylinder(p - vec3(0.0, 0.1, 0.0), vec2(h.x - thickness * 2.0, h.y + 0.2))),
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
    return min(moonQuarter(p, vec2(1.0 - WALL_THICKNESS, BEAM_WIDTH), BEAM_THICKNESS),
    min(moonQuarter(p, vec2(1.0 - WALL_THICKNESS - BEAM_WIDTH * 2.0, BEAM_WIDTH), BEAM_THICKNESS),
    moonQuarter(p, vec2(1.0 - WALL_THICKNESS, BEAM_THICKNESS), BEAM_WIDTH)));
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

vec2 elevatorShaft(vec3 p)
{
    vec3 q = vec3(p.x, mod(p.y + FLOOR_HEIGHT, FLOOR_HEIGHT * 2.0) -
    FLOOR_HEIGHT, p.z);
    //q = p;

    vec2 bwall = vec2(B_WALL_ID,  box(q - vec3(0.0, 0.0, -1.0),
        vec3(1.0, FLOOR_HEIGHT, WALL_THICKNESS)));
    vec2 rwall = vec2(R_WALL_ID, box(q - vec3(-1.0, 0.0, 0.0),
        vec3(WALL_THICKNESS, FLOOR_HEIGHT, 1.0)));
    vec2 lwall = vec2(L_WALL_ID, box(q - vec3(1.0, 0.0, 0.0),
        vec3(WALL_THICKNESS, FLOOR_HEIGHT, 1.0)));
    vec2 fwall = vec2(F_WALL_ID, moonQuarter(q - vec3(0.0, 0.0, 1.0),
        vec2(1.0 + WALL_THICKNESS, FLOOR_HEIGHT), WALL_THICKNESS));
    vec2 beams = vec2(BEAM_ID, beams(q));

    vec2 ret = (bwall.y < fwall.y) ? bwall : fwall;
    ret = (ret.y < lwall.y) ? ret : lwall;
    ret = (ret.y < rwall.y) ? ret : rwall;
    ret = (ret.y < beams.y) ? ret : beams;

    return ret;
}

vec2 elevator(vec3 p)
{
    vec2 bwall = vec2(X_WINDOW_ID,  box(p - vec3(0.0, 0.0, -0.7),
        vec3(1.0 - BEAM_WIDTH * 2.0, FLOOR_HEIGHT, BEAM_THICKNESS)));
    vec2 rwall = vec2(Z_WINDOW_ID, box(p - vec3(-1.0 + BEAM_WIDTH * 2.0, 0.0, 0.0),
        vec3(BEAM_THICKNESS, FLOOR_HEIGHT, 0.7)));
    vec2 lwall = vec2(Z_WINDOW_ID, box(p - vec3(1.0 - BEAM_WIDTH * 2.0 , 0.0, 0.0),
        vec3(BEAM_THICKNESS, FLOOR_HEIGHT, 0.7)));
    vec2 fwall = vec2(X_WINDOW_ID, moonQuarter(p - vec3(0.0, 0.0, 0.7),
        vec2(1.0 + WALL_THICKNESS - BEAM_WIDTH * 2.0 , FLOOR_HEIGHT), BEAM_THICKNESS));

    return vec2(17.0, 1.0);
}

vec2 map(vec3 p)
{
    vec2 ground = vec2(0, plane(p - vec3(0.0, -2.0, 0.0), vec4(0.0, 1.0, 0.0, 0.0)));
    vec2 elevatorShaft = elevatorShaft(p);
    vec2 elevator = elevator(p);

    vec2 ret = (ground.y < elevatorShaft.y) ? ground : elevatorShaft;
    ret = (ret.y < elevator.y) ? ret : elevator;

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
    float h = iGlobalTime;
    ro.y = h;
    ta.x = sin(iGlobalTime * SPEED * 0.2);
    ta.y = h + 3.0;
    ta.z = cos(iGlobalTime * SPEED * 0.2);
}

float softshadow( in vec3 ro, in vec3 rd, in float tmin, in float tmax )
{
    float res = 1.0;
    float t = tmin;
    for( int i=0; i<16; i++ )
    {
        float h = map( ro + rd*t ).x;
        res = min( res, 8.0*h/t );
        t += clamp( h, 0.02, 0.10 );
        if(h < 0.001 || t > tmax)
        break;
    }
    return clamp( res, 0.0, 1.0 );

}

void main()
{

    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 p = -1.0 + 2.0 * uv;
    p.x *= iResolution.x / iResolution.y;

    float c = FPSDisplay(gl_FragCoord.xy / 5.);
    if (c > 0.) {
        fragColor = vec3(0.1, 1.0, 0.2);
        return ;
    }

    // Camera
    vec3 ro = vec3(0.0);
    vec3 ta = vec3(1.0);
    animate(ro, ta);
    vec3 cf = normalize(ta - ro);
    vec3 cr = normalize(cross(cf, vec3(0.0, 1.0, 0.0)));
    vec3 cu = normalize(cross(cr, cf));
    vec3 rd = normalize(p.x*cr + p.y*cu + 2.5*cf);

    float t = 0.0;
    vec2 res = vec2(-1.0, 1.0);
    for (int i = 0; i < MAXSTEP; i++)
    {
        if (res.y < 0.000001 || t > FAR)
            break;
        res = map(ro + t * rd);
        t += res.y;
    }

    // intersect an object
    if (t > FAR)
    {
        fragColor = vec3(0.5, 0.6, 0.7);
        return;
    }

    vec3 pos = ro + t * rd;
    vec3 n = normal(pos);
    vec3 ref = reflect(rd, n);
    vec3 col = getMaterial(pos, res.x);

    // Lights and shadows
    vec3 light = normalize(vec3(0.5));
    float amb = 0.1;
    float dif = clamp(dot(n, light), 0.0, 1.0);
    float spe = pow(clamp(dot(ref, light), 0.0, 1.0), 16.0);
    float sha = softshadow(pos, light, 0.02, 2.5);
    vec3 lcol = vec3(1.0, 0.9, 0.6);
    vec3 lig = sha*dif*lcol + 2.*spe*lcol*dif + amb;
    col *= lig;

    // Fog
    float fogval = exp(-pow(1.8*length(pos - ro)/FAR, 2.));

    fragColor = mix(vec3(0.5, 0.6, 0.7), col, fogval);
}
