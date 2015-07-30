# vim: set filetype=cmake :

cmake_minimum_required(VERSION 2.8)
project(PRPA2)

find_package(PkgConfig REQUIRED)
find_package(OpenGL REQUIRED)
find_package(OpenAL REQUIRED)
find_package(GLEW REQUIRED)
pkg_search_module(GLFW REQUIRED glfw3)

include_directories(${OPENGL_INCLUDE_DIRS})
include_directories(${OPENAL_INCLUDE_DIRS})
include_directories(${GLFW_INCLUDE_DIRS})
include_directories(${GLEW_INCLUDE_DIRS})
include_directories(src)

set(EXECUTABLE_OUTPUT_PATH ..)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++14 -g3")

FILE(
    GLOB_RECURSE
    source_files
    src/*.cc
)

FILE(
    GLOB_RECURSE
    header_files
    src/*.hh
)

add_executable(prpa2 ${header_files} ${source_files})
target_link_libraries(prpa2 ${OPENGL_LIBRARIES} ${GLFW_LIBRARIES} ${GLEW_LIBRARIES} ${OPENAL_LIBRARIES} openal alut)
