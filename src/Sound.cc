#include <iostream>
#include <stdint.h>
#include <inttypes.h>

#include <AL/al.h>
#include <AL/alc.h>
#include <AL/alut.h>


static inline ALenum to_al_format(short channels, short samples)
{
    static const ALenum formats[] = {
        AL_FORMAT_MONO8,
        AL_FORMAT_STEREO8,
        AL_FORMAT_MONO16,
        AL_FORMAT_STEREO16,
    };
    return formats[((samples >> 3) - 1) * 2 + (channels > 1)];
}

int main(int argc, char **argv)
{
	const ALCchar *defaultDeviceName = alcGetString(NULL, ALC_DEFAULT_DEVICE_SPECIFIER);
	ALCdevice *device = alcOpenDevice(defaultDeviceName);

	if (!device) {
        std::cerr << "unable to open default device" << std::endl;
		return -1;
	}

	ALCcontext *context = alcCreateContext(device, NULL);

	if (!alcMakeContextCurrent(context)) {
        std::cerr << "failed to make default context" << std::endl;
		return -1;
	}

	/* set orientation */
	alListener3f(AL_POSITION, 0, 0, 1.0f);
    alListener3f(AL_VELOCITY, 0, 0, 0);

    ALfloat orient[] = { 0.0f, 0.0f, 1.0f, 0.0f, 1.0f, 0.0f };
	alListenerfv(AL_ORIENTATION, orient);

	ALuint buffer, source;

	alGenSources((ALuint)1, &source);
	alSourcef(source, AL_PITCH, 1);
	alSourcef(source, AL_GAIN, 1);
	alSource3f(source, AL_POSITION, 0, 0, 0);
	alSource3f(source, AL_VELOCITY, 0, 0, 0);
	alSourcei(source, AL_LOOPING, AL_FALSE);

	ALvoid *data;
	ALsizei size, freq;
	ALenum format;

	alGenBuffers(1, &buffer);
	ALboolean loop = AL_FALSE;
    signed char f[] = "test.wav";
	alutLoadWAVFile(f, &format, &data, &size, &freq, &loop);
	alBufferData(buffer, format, data, size, freq);
	alSourcei(source, AL_BUFFER, buffer);
	alSourcePlay(source);
	ALint source_state;

	alGetSourcei(source, AL_SOURCE_STATE, &source_state);
	while (source_state == AL_PLAYING) {
		alGetSourcei(source, AL_SOURCE_STATE, &source_state);
	}

	/* exit context */
	alDeleteSources(1, &source);
	alDeleteBuffers(1, &buffer);
	device = alcGetContextsDevice(context);
	alcMakeContextCurrent(NULL);
	alcDestroyContext(context);
	alcCloseDevice(device);

	return 0;
}
