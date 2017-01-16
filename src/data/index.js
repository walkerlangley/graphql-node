const videoA = {
  id: 'a',
  title: 'Create a GraphQL Schema',
  duration: 120,
  watched: true,
};

const videoB = {
  id: 'b',
  title: 'Ember.js CLI',
  duration: 240,
  watched: false,
};

const videos = [videoA, videoB];


const books = [
  {
    id: '1',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    genre: 'Educational',
    haveRead: false
  },
  {
    id: '2',
    title: 'A Brave New World',
    author: 'Aldous Huxley',
    genre: 'Non-Fiction',
    haveRead: false
  },
  {
    id: '3',
    title: 'Dead Wake',
    author: 'Erik Larson',
    genre: 'Non-Fiction',
    haveRead: false
  },
]

const getVideoById = (id) => new Promise((resolve) => {
  const [video] = videos.filter((video) => {
    return video.id === id;
  });

  resolve(video);
});

const getVideos = () => new Promise((resolve) => resolve(videos));

const createVideo = ({ title, duration, released }) => {
  const video = {
    id: (new Buffer(title, 'utf8')).toString('base64'),
    title,
    duration,
    released
  };

  videos.push(video);

  return video;
};

const getBookById = (id) => new Promise((resolve) => {
  const [book] = books.filter((book) => {
    return book.id === id;
  });

  resolve(book);
});

const getBooks = () => new Promise((resolve) => resolve(books));

const getObjectById = (type, id) => {
  const types = {
    video: getVideoById,
  }

  return types[type](id);
}

exports.getVideoById = getVideoById;
exports.getVideos = getVideos;
exports.createVideo = createVideo;
exports.getObjectById = getObjectById;
exports.getBooks = getBooks;
exports.getBookById = getBookById;
