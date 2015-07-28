all: build/Makefile
	make -C build

build/Makefile: CMakeLists.txt
	mkdir -p build
	cd build && cmake ..

clean:
	make -C build clean

distclean:
	rm -rf build

.PHONY: all clean distclean
