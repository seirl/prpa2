#ifndef DEMO_HH
# define DEMO_HH

# include "Window.hh"

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

        Window* window;
        GLuint vertexArrayID;
        GLuint quad;
        GLuint programID;

        double FPS;
};

#endif /* !DEMO_HH */
