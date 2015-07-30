#pragma once

#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <string>

class GL
{
    public:
        static GLuint loadShader(const std::string& vertex_file_path,
                                 const std::string& fragment_file_path);

    private:
        static std::string readFile(const std::string& path);
};
