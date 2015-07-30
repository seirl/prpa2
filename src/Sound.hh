#pragma once

#include <AL/al.h>
#include <AL/alc.h>
#include <AL/alut.h>

class Sound
{
public:
    Sound();
    ~Sound();

    void play_buffer(ALvoid *data, ALsizei size, ALsizei freq, ALenum format);
    void play_test_wav();
    bool is_playing();

private:
    ALuint source_;
    ALuint buffer_;
    ALCcontext* context_;
};
