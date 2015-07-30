#pragma once

#include <vector>
#include <memory>

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

        Demo();
        ~Demo();

    private:
        void init();
        void update();
        void render();
        void renderSound(float time);
        void playSoundBuffer();
        bool running();
        size_t elapsedTime();

        static std::unique_ptr<Demo> instance;

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
