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
}

Demo::~Demo()
{
}

void Demo::launch(void)
{
    init();
    while (running())
    {
        update();
        window->clear();
        render();
        window->swapBuffers();
    }
    finish();
}

void Demo::init(void)
{
    window = new Window(1280, 720, "PRPA2");
    std::string vert("src/shader.vert"), frag("src/shader.frag");
    programID = GL::loadShader(vert, frag);

    static const GLfloat quad_vertex_buffer[] = {
        -1.0f, -1.0f,
        1.0f,  -1.0f,
        1.0f,   1.0f,
        -1.0f,  1.0f
    };

    glBindBuffer(GL_ARRAY_BUFFER, quad);
    glBufferData(GL_ARRAY_BUFFER, 4, quad_vertex_buffer, GL_STATIC_DRAW);

    glBindBuffer(GL_ARRAY_BUFFER, 0);

}

void Demo::update(void)
{
    window->poll_events();
}

void Demo::render(void)
{
    glUseProgram(programID);

    glUniform2f(glGetUniformLocation(programID, "iResolution"), window->get_w(), window->get_h());
    glUniform1f(glGetUniformLocation(programID, "iGlobalTime"), elapsedTime() / 1000.0f);

    glEnableVertexAttribArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, quad);
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 0, (void*)0);
    glDrawArrays(GL_QUADS, 0, 4);
    glDisableVertexAttribArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
}

bool Demo::running(void)
{
    return !window->should_close();
}

void Demo::finish(void)
{
    delete window;
}

size_t Demo::elapsedTime(void)
{
    static auto begin = std::chrono::high_resolution_clock::now();
    auto now = std::chrono::high_resolution_clock::now() - begin;
    return std::chrono::duration_cast<std::chrono::milliseconds>(now).count();
}
