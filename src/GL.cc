#include "GL.hh"
#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>

GLuint GL::loadShader(std::string& vertex_file_path, std::string& fragment_file_path)
{
    GLuint vertex_shader_ID = glCreateShader(GL_VERTEX_SHADER);
    GLuint fragment_shader_ID = glCreateShader(GL_FRAGMENT_SHADER);

    std::string vertex_shader_code = readFile(vertex_file_path);
    std::string fragment_shader_code = readFile(fragment_file_path);

    GLint result = GL_FALSE;
    int info_log_length;

    char const * vertex_source_pointer = vertex_shader_code.c_str();
    glShaderSource(vertex_shader_ID, 1, &vertex_source_pointer, nullptr);
    glCompileShader(vertex_shader_ID);

    glGetShaderiv(vertex_shader_ID, GL_COMPILE_STATUS, &result);
    glGetShaderiv(vertex_shader_ID, GL_INFO_LOG_LENGTH, &info_log_length);
    std::vector<char> vertex_shader_error_message;
    vertex_shader_error_message.resize(info_log_length);
    glGetShaderInfoLog(vertex_shader_ID, info_log_length, nullptr, &vertex_shader_error_message[0]);

    char const * fragment_source_pointer = fragment_shader_code.c_str();
    glShaderSource(fragment_shader_ID, 1, &fragment_source_pointer, nullptr);
    glCompileShader(fragment_shader_ID);

    glGetShaderiv(fragment_shader_ID, GL_COMPILE_STATUS, &result);
    glGetShaderiv(fragment_shader_ID, GL_INFO_LOG_LENGTH, &info_log_length);
    std::vector<char> fragment_shader_error_message;
    fragment_shader_error_message.resize(info_log_length);
    glGetShaderInfoLog(fragment_shader_ID, info_log_length, nullptr, &fragment_shader_error_message[0]);

    GLuint program_ID = glCreateProgram();
    glAttachShader(program_ID, vertex_shader_ID);
    glAttachShader(program_ID, fragment_shader_ID);
    glLinkProgram(program_ID);

    glGetProgramiv(program_ID, GL_LINK_STATUS, &result);
    glGetProgramiv(program_ID, GL_INFO_LOG_LENGTH, &info_log_length);
    std::vector<char> program_error_message;
    program_error_message.resize(std::max(info_log_length, int(1)));
    glGetProgramInfoLog(program_ID, info_log_length, nullptr, &program_error_message[0]);

    glDeleteShader(vertex_shader_ID);
    glDeleteShader(fragment_shader_ID);

    return program_ID;
}

std::string GL::readFile(std::string& path)
{
  std::ifstream file(path, std::ios_base::in);
  std::string res((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
  file.close();
  return res;
} 
