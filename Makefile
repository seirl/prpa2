all: build
	make -C build

build: CMakeLists.txt
	mkdir -p build
	cd build && cmake ..
