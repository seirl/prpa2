#include "Demo.hh"
int main()
{
    Demo& demo = Demo::getInstance();
    demo.launch();
}
