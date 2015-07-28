all: build/Makefile
	make -C build

build/Makefile: CMakeLists.txt
	mkdir -p build
	cd build && cmake ..

.PHONY: all
