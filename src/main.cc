#include "Demo.hh"
int main(void)
{
    Demo& demo = Demo::getInstance();
    demo.launch();
}
