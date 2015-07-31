#include "Demo.hh"

#include <string>
#include <memory>
#include "GL.hh"

std::unique_ptr<Demo> Demo::instance;

Demo& Demo::getInstance()
{
    if (!instance)
        instance = std::make_unique<Demo>();
    return *instance;
}

Demo::Demo()
  : window(nullptr)
  , vertexArrayID(0)
  , sound_data(4 * sound_width * sound_height)
  , begin(std::chrono::high_resolution_clock::now())
{
}

Demo::~Demo()
{
    glDeleteProgram(programID);
    glDeleteProgram(soundProgramID);
    glDeleteBuffers(1, &quad);
    glDeleteVertexArrays(1, &vertexArrayID);
    delete window;
    delete sound;
}

void Demo::launch()
{
    init();
    renderSound(0.0);
    begin = std::chrono::high_resolution_clock::now();
    playSoundBuffer();
    while (running())
    {
        update();
        window->clear();
        render();
        window->swapBuffers();

        if (!sound->is_playing())
            playSoundBuffer();
    }
}

void Demo::reloadShader()
{
    programID = GL::loadShader("src/shader.vert",
                               "src/shader.frag");

    soundProgramID = GL::loadShader("src/sound_shader.vert",
                                    "src/sound_shader.frag");
}

void Demo::init()
{
    window = new Window(800, 600, "PRPA2");
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


    glGenBuffers(1, &soundBuffer);
    glBindBuffer(GL_ARRAY_BUFFER, soundBuffer);
    glBufferData(GL_ARRAY_BUFFER, sizeof (quad_vertex_buffer),
            quad_vertex_buffer, GL_STATIC_DRAW);


    reloadShader();
}

void Demo::update()
{
    static size_t lastTime = elapsedTime();
    static size_t frames = 0;
    window->poll_events();
    ++frames;
    size_t currentTime = elapsedTime();
    if (currentTime - lastTime > 500)
    {
      FPS = frames * 1000.0 / (currentTime - lastTime);
      frames = 0;
      lastTime = currentTime;
    }
}

void Demo::render()
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

void Demo::renderSound(float time)
{
    glEnableVertexAttribArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, soundBuffer);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, nullptr);
    glUseProgram(soundProgramID);
    glUniform1f(glGetUniformLocation(soundProgramID, "iGlobalTime"), time);
    glUniform2f(glGetUniformLocation(soundProgramID, "iResolution"), sound_width, sound_height);
    glUniform1f(glGetUniformLocation(soundProgramID, "iSampleRate"), sound_sample_rate);
    glDrawArrays(GL_TRIANGLES, 0, 6);

    glReadPixels(0, 0, sound_width, sound_height, GL_RGBA, GL_UNSIGNED_BYTE, &sound_data[0]);

    glDisableVertexAttribArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
}

void Demo::playSoundBuffer()
{
    sound->play_buffer(&sound_data[0], sound_data.size(), sound_sample_rate, AL_FORMAT_MONO8);
}

bool Demo::running()
{
    return !window->should_close();
}

size_t Demo::elapsedTime()
{
    auto now = std::chrono::high_resolution_clock::now() - begin;
    return std::chrono::duration_cast<std::chrono::milliseconds>(now).count();
}
