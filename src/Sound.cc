#include <iostream>
#include <stdint.h>
#include <inttypes.h>

#include "Sound.hh"

Sound::Sound()
{
	const ALCchar *defaultDeviceName = alcGetString(NULL, ALC_DEFAULT_DEVICE_SPECIFIER);
	ALCdevice* device = alcOpenDevice(defaultDeviceName);

	if (!device)
        throw std::runtime_error("unable to open default device");

	context_ = alcCreateContext(device, NULL);

	if (!alcMakeContextCurrent(context_))
        throw std::runtime_error("failed to make default context");

	/* set orientation */
	alListener3f(AL_POSITION, 0, 0, 1.0f);
    alListener3f(AL_VELOCITY, 0, 0, 0);

    ALfloat orient[] = { 0.0f, 0.0f, 1.0f, 0.0f, 1.0f, 0.0f };
	alListenerfv(AL_ORIENTATION, orient);

	alGenSources(1u, &source_);
	alSourcef(source_, AL_PITCH, 1);
	alSourcef(source_, AL_GAIN, 1);
	alSource3f(source_, AL_POSITION, 0, 0, 0);
	alSource3f(source_, AL_VELOCITY, 0, 0, 0);
	alSourcei(source_, AL_LOOPING, AL_FALSE);

	alGenBuffers(1, &buffer_);
}

Sound::~Sound()
{
	/* exit context */
	alDeleteSources(1, &source_);
	alDeleteBuffers(1, &buffer_);
	ALCdevice* device = alcGetContextsDevice(context_);
	alcMakeContextCurrent(NULL);
	alcDestroyContext(context_);
	alcCloseDevice(device);
}

void Sound::play_test_wav()
{
    ALvoid *data;
    ALsizei size, freq;
    ALenum format;
	ALboolean loop = AL_FALSE;
    signed char f[] = "test.wav";
	alutLoadWAVFile(f, &format, &data, &size, &freq, &loop);

    play_buffer(data, size, freq, format);
}

bool Sound::is_playing()
{
    ALint source_state;
	alGetSourcei(source_, AL_SOURCE_STATE, &source_state);
    return source_state == AL_PLAYING;
}

void Sound::play_buffer(ALvoid *data, ALsizei size, ALsizei freq, ALenum format)
{
	alBufferData(buffer_, format, data, size, freq);
	alSourcei(source_, AL_BUFFER, buffer_);
	alSourcePlay(source_);
}
