#pragma once

#include <vector>

#include "Window.hh"
#include "Sound.hh"

const size_t sound_width = 128;
const size_t sound_height = 64;
const size_t sound_sample_rate = 44100;

class Demo
{
    public:
        static Demo& getInstance(void);
        void launch(void);
        void reloadShader(void);

    private:
        Demo();
        ~Demo();

        void init(void);
        void update(void);
        void render(void);
        void renderSound(float time);
        bool running(void);
        size_t elapsedTime(void);

        static Demo* instance;

        Sound* sound;
        Window* window;
        GLuint vertexArrayID;
        GLuint quad;
        GLuint programID;

        GLuint soundProgramID;
        GLuint soundBuffer;

        std::vector<unsigned char> sound_data;

        float FPS;
};
