#include "Window.hh"
#include <iostream>
#include <cstdlib>
#include "Demo.hh"

Window::Window(int w, int h, std::string title)
{
    glfwSetErrorCallback(error_callback);
    if (!glfwInit())
        std::exit(-1);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 4);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    window = glfwCreateWindow(w, h, title.c_str(), nullptr, nullptr);
    if (!window)
    {
        glfwTerminate();
        std::exit(-1);
    }
    glfwMakeContextCurrent(window);
    glfwSetKeyCallback(window, key_callback);
    glewExperimental = GL_TRUE;
    if (glewInit() != GLEW_OK)
    {
        glfwTerminate();
        std::exit(-1);
    }
    glClearColor(0.0f, 0.0f, 0.0f, 0.0f);
    this->w = w;
    this->h = h;
    ratio = w / (float)h;
}

Window::~Window()
{
    glfwDestroyWindow(window);
    glfwTerminate();
}

int Window::should_close()
{
    return glfwWindowShouldClose(window);
}

void Window::poll_events()
{
    glfwPollEvents();
}

void Window::swapBuffers()
{
    glfwSwapBuffers(window);
}

void Window::clear()
{
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}

int Window::get_w()
{
    return w;
}

int Window::get_h()
{
    return h;
}

float Window::get_ratio()
{
    return ratio;
}

void Window::error_callback(int error, const char* description)
{
    std::cerr << "Error " << error << " : " << description << std::endl;
}

void Window::key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
{
    if (action != GLFW_PRESS)
        return;
    switch (key)
    {
        case GLFW_KEY_ESCAPE:
            glfwSetWindowShouldClose(window, GL_TRUE);
            break;
        case GLFW_KEY_R:
            Demo::getInstance().reloadShader();
            break;
    }
}
