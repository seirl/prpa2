#ifndef WINDOW_HH
# define WINDOW_HH

#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <string>

class Window
{
    public:
        Window(int w, int h, std::string title);
        ~Window();
        int should_close();
        void poll_events();
        void swapBuffers();
        void clear();
        int get_w();
        int get_h();
        float get_ratio();

    private:
        GLFWwindow* window;
        int w;
        int h;
        float ratio;
        static void error_callback(int error, const char* description);
        static void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods);
};

#endif /* !WINDOW_HH */
