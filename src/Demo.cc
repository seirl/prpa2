#include "Demo.hh"

#include <chrono>
#include <string>
#include "GL.hh"

Demo* Demo::instance = nullptr;

Demo& Demo::getInstance(void)
{
    if (instance == nullptr)
        instance = new Demo();
    return *instance;
}

Demo::Demo()
{
    window = nullptr;
    vertexArrayID = 0;
}

Demo::~Demo()
{
    glDeleteProgram(programID);
    glDeleteBuffers(1, &quad);
    glDeleteVertexArrays(1, &vertexArrayID);
    delete window;
}

void Demo::launch(void)
{
    init();

    size_t nbFrames = 0;
    size_t currentTime;
    size_t lastTime = elapsedTime();

    while (running())
    {
        update();
        window->clear();
        render();
        window->swapBuffers();

        // FPS count
        currentTime = elapsedTime();
        nbFrames++;
        if (currentTime - lastTime >= 1000) {
            FPS = nbFrames;
            nbFrames = 0;
            lastTime = currentTime;
        }
    }
}

void Demo::reloadShader(void)
{
    std::string vert("src/shader.vert"), frag("src/shader.frag");
    programID = GL::loadShader(vert, frag);
}

void Demo::init(void)
{
    window = new Window(1280, 720, "PRPA2");
    sound = new Sound();

    glGenVertexArrays(1, &vertexArrayID);
    glBindVertexArray(vertexArrayID);

    glGenBuffers(1, &quad);

    static const GLfloat quad_vertex_buffer[] = {
        -1.0f,  1.0f, 0.0f,
        1.0f,   1.0f, 0.0f,
        -1.0f, -1.0f, 0.0f,

        -1.0f, -1.0f, 0.0f,
        1.0f,   1.0f, 0.0f,
        1.0f,  -1.0f, 0.0f
    };

    glBindBuffer(GL_ARRAY_BUFFER, quad);
    glBufferData(GL_ARRAY_BUFFER, sizeof (quad_vertex_buffer), quad_vertex_buffer, GL_STATIC_DRAW);

    std::string vert("src/shader.vert"), frag("src/shader.frag");
    programID = GL::loadShader(vert, frag);
}

void Demo::update(void)
{
    window->poll_events();
}

void Demo::render(void)
{
    glEnableVertexAttribArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, quad);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, nullptr);

    glUseProgram(programID);
    glUniform2f(glGetUniformLocation(programID, "iResolution"), window->get_w(), window->get_h());
    glUniform1f(glGetUniformLocation(programID, "iGlobalTime"), elapsedTime() / 1000.0f);
    glUniform1f(glGetUniformLocation(programID, "FPS"), FPS);

    glDrawArrays(GL_TRIANGLES, 0, 6);
    glDisableVertexAttribArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
}

bool Demo::running(void)
{
    return !window->should_close();
}

size_t Demo::elapsedTime(void)
{
    static auto begin = std::chrono::high_resolution_clock::now();
    auto now = std::chrono::high_resolution_clock::now() - begin;
    return std::chrono::duration_cast<std::chrono::milliseconds>(now).count();
}
