#pragma once
#include "Window.hh"
#include "Sound.hh"

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
        bool running(void);
        size_t elapsedTime(void);

        static Demo* instance;

        Sound* sound;
        Window* window;
        GLuint vertexArrayID;
        GLuint quad;
        GLuint programID;

        double FPS;
};
