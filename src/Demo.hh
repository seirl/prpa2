#pragma once

#include <chrono>
#include <vector>
#include <memory>

#include "Window.hh"
#include "Sound.hh"

const size_t sound_width = 735;
const size_t sound_height = 483;
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
        std::chrono::time_point<std::chrono::high_resolution_clock> begin;

        float FPS;
};
