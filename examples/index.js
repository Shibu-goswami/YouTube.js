'use strict';

const fs = require('fs');
const Innertube = require('..');

async function start() {
  const youtube = await new Innertube();

  // Searching, getting details about videos & making interactions:
  const search = await youtube.search('Looking for life on Mars - documentary');
  console.info('Search results:', search);
  
  if (search.videos.length === 0) 
    return console.error('Could not find any video about that on YouTube.');
  
  const video = await youtube.getDetails(search.videos[0].id).catch((error) => error);
  console.info('Video details:', video);
 
  if (video instanceof Error) 
    return console.error('Could not get details for ' + search.videos[0].title);
  
  if (youtube.logged_in) {
    const myNotifications = await youtube.getNotifications();
    console.info('My notifications:', myNotifications);

    const like = await video.like();
    if (like.success) {
      console.info('Video marked as liked!');
    }

    const dislike = await video.dislike();
    if (dislike.success) {
      console.info('Video marked as disliked!');
    }

    const removeDislikeOrLike = await video.removeLike();
    if (removeDislikeOrLike.success) {
      console.info('Removed the dislike/like!')
    }

    const myComment = await video.comment('Haha, nice!');
    if (myComment.success) {
      console.info('Comment successfully posted!')
    }

    const subscribe = await video.subscribe();
    if (subscribe.success) {
      console.info('Just subscribed to', video.metadata.channel_name + '!');
    }

    const unsubscribe = await video.unsubscribe();
    if (unsubscribe.success) {
      console.info('Just unsubscribed from', video.metadata.channel_name + ' :(');
    }
  }

  // Downloading videos:
  const stream = youtube.download(search.videos[0].id, {
    format: 'mp4', // Optional, ignored when type is set to audio and defaults to mp4, and I recommend to leave it as it is
    quality: '360p', // if a video doesn't have a specific quality it'll fall back to 360p, this is ignored when type is set to audio
    type: 'videoandaudio' // can be “video”, “audio” and “videoandaudio”
  });

  stream.pipe(fs.createWriteStream(`./${search.videos[0].id}.mp4`));

  stream.on('start', () => {
    console.info('[DOWNLOADER]', 'Starting download now!');
  });

  stream.on('info', (info) => {
    console.info('[DOWNLOADER]', `Downloading ${info.video_details.title} by ${info.video_details.metadata.channel_name}`);
  });

  stream.on('end', () => {
    console.info('[DOWNLOADER]', 'Done!');
  });

  stream.on('error', (err) => console.error('[ERROR]', err));
}

start();