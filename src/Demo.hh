#ifndef DEMO_HH
# define DEMO_HH

# include "Window.hh"

class Demo
{
    public:
        static Demo& getInstance(void);
        void launch(void);

    private:
        Demo();
        ~Demo();

        void init(void);
        void update(void);
        void render(void);
        bool running(void);
        void finish(void);
        size_t elapsedTime(void);

        static Demo* instance;

        Window* window;
        GLuint programID;
        GLuint quad;
};

#endif /* !DEMO_HH */
