#pragma once

#include <vector>

#include "Window.hh"
#include "Sound.hh"

const size_t sound_width = 596;
const size_t sound_height = 596;
const size_t sound_sample_rate = 44100;

class Demo
{
    public:
        static Demo& getInstance();
        void launch();
        void reloadShader();

    private:
        Demo();
        ~Demo();

        void init();
        void update();
        void render();
        void renderSound(float time);
        bool running();
        size_t elapsedTime();

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
