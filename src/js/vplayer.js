var app = new Vue({
  el: '#app',
  data: {
    audio: document.createElement('audio'),
    storage: window.localStorage,
    range: 0.5,
    progress: 0,
    playingId: '',
    playingTitle: '',
    playingArtist: '',
    playingPic: '',
    showCurrentTime: '0:00',
    showDurationTime: '0:00',
    currentIndex: 0,
    search: '',
    lyricText: '',
    lyric: [],
    songLists: [],
    playingLists: [],
    pageNumber: 1,
    pages: 0,
    offset: 30,
    isNext: false,
    lock: false,
    listOpen: false,
    isMuted: false,
    isPlay: false,
    isActive: false,
    goSearch: false,
    isMove: false,
    isSearch: false,
    isNull: true
  },
  created: function () {
    this.firstOrCreate();
  },
  mounted: function () {
    setInterval(this.setProgress, 500);
    this.audio.addEventListener("timeupdate", this.updateLyric);
    this.audio.addEventListener("ended", this.autoNextPlay);
  },
  methods: {
    // 第一次创建（初始化）
    firstOrCreate: function () {
      this.playingLists = JSON.parse(this.storage.getItem('playerList'));
      if (this.playingLists === null || this.playingLists.length === 0) {
        this.playingLists = [];
        var tmp = {
          'id': 35283615,
          'title': 'Dreams',
          'picUrl': 'http://p3.music.126.net/tbnn45UGaEmkqXQlpD1iVQ==/3445869441930235.jpg',
          'artists': 'Tobu'
        };
        this.playingLists.push(tmp);
        this.storage.setItem('playerList', JSON.stringify(this.playingLists));
      }
      this.audio.volume = 0.5;
      this.playingId = this.playingLists[0].id;
      this.playingTitle = this.playingLists[0].title;
      this.playingArtist = this.playingLists[0].artists;
      this.playingPic = this.playingLists[0].picUrl;
      this.$http.get('api/mp3url.php', {
          params: {
            'id': this.playingLists[0].id
          }
        })
        .then(function (response) {
          var mp3 = response.body.data[0];
          this.audio.src = mp3.url;
        }, function (error) {
          //error callback
          console.log(error);
        });
    },
    // 去搜索
    goSearch: function () {
      this.goSearch = true;
      document.querySelector('input[name="search"]').focus();
    },
    // 自动播放
    setAutoPlay: function () {
      this.audio.autoplay = !this.audio.autoplay;
      alert(this.audio.autoplay);
    },
    // 播放歌曲
    setPlay: function (id) {
      if (this.audio.paused) {
        this.audio.play();
        this.isPlay = true;
        this.getSongLyric(id);
      } else {
        this.audio.pause();
        this.isPlay = false;
      }
    },
    // 调节音量
    setVolume: function () {
      this.audio.volume = this.range;
      if (this.audio.volume === 0) {
        this.isMuted = true;
      } else {
        this.isMuted = false;
        this.audio.muted = false;
      }
    },
    // 静音
    setMuted: function () {
      this.audio.muted = !this.audio.muted;
      this.isMuted = this.audio.muted;
    },
    // 单曲循环
    setLoop: function () {
      this.audio.loop = !this.audio.loop;
      this.isActive = !this.isActive;
      console.log(this.audio.loop);
    },
    // 随机播放
    setRandom: function () {
      alert('功能暂未实现！');
    },
    // 打开/关闭歌单列表
    isListOpen: function () {
      this.listOpen = !this.listOpen;
    },
    // 播放进度条
    setProgress: function () {
      var MM, SS, CT, DT,
        currentTime = this.audio.currentTime,
        duration = this.audio.duration;
      MM = parseInt(currentTime / 60);
      SS = parseInt(currentTime % 60);
      this.showCurrentTime = CT = MM + ':' + (SS < 10 ? '0' + SS : SS);

      MM = parseInt(duration / 60);
      SS = parseInt(duration % 60);
      this.showDurationTime = DT = MM + ':' + (SS < 10 ? '0' + SS : SS);

      var value = currentTime / duration * 100;
      this.progress = value.toFixed(3);
    },
    // 搜索歌曲
    formSubmit: function () {
      this.goSearch = true;
      if (this.search === '') {
        return false;
      }
      this.$http.get('api/search.php', {
          params: {
            's': this.search
          }
        })
        .then(function (response) {
          this.songLists = response.body.result.songs;
          this.isSearch = true;
        }, function (error) {
          // error callback
          console.log(error);
        });
    },
    // 播放歌曲
    playMusic: function (id) {
      var lyricContainer = document.querySelector('#lyricContainer');
      lyricContainer.style.top = 110 + 'px';
      this.getMp3Url(id);
      this.$http.get('api/detail.php', {
          params: {
            'id': id
          }
        })
        .then(function (response) {
          var result = response.body.songs[0];
          var id = result.id,
            title = result.name,
            picUrl = result.al.picUrl,
            artist = [],
            artists;
          for (var i = 0; i < result.ar.length; i++) {
            artist.push(result.ar[i].name)
          }
          artists = artist.join('/')
          this.playingTitle = title;
          this.playingArtist = artists;
          this.playingPic = picUrl;
          var tempData = {
            'id': id,
            'title': title,
            'picUrl': picUrl,
            'artists': artists
          };
          var obj = JSON.parse(this.storage.getItem('playerList'));
          console.log(obj.length);
          this.currentIndex = obj.length;
          if (obj === null) {
            this.playingLists.push(tempData);
            this.storage.setItem('playerList', JSON.stringify(this.playingLists));
          } else {
            for (var i = 0; i < obj.length; i++) {
              if (tempData.id == obj[i].id) {
                this.lock = true;
                break;
              } else {
                this.lock = false;
              }
            }
          }
          if (this.lock === false) {
            this.playingLists = obj;
            this.playingLists.push(tempData);
            this.storage.setItem('playerList', JSON.stringify(this.playingLists));
          } else {
            alert('歌曲已经存在歌单中');
            return false;
          }
        }, function (error) {
          console.log(error);
        });
    },
    // 播放历史歌单
    playHistoryList: function (id, index) {
      var lyricContainer = document.querySelector('#lyricContainer');
      lyricContainer.style.top = 110 + 'px';
      this.currentIndex = index;
      this.getMp3Url(id);
      var music = JSON.parse(this.storage.getItem('playerList'));
      this.playingTitle = music[index].title;
      this.playingArtist = music[index].artists;
      this.playingPic = music[index].picUrl;
    },
    // 播放下一首
    nextPlay: function () {
      var next = JSON.parse(this.storage.getItem('playerList'));
      if ((this.currentIndex + 1) == next.length) {
        this.currentIndex = 0;
      } else {
        this.currentIndex = ++this.currentIndex;
      }
      this.playingTitle = next[this.currentIndex].title;
      this.playingArtist = next[this.currentIndex].artists;
      this.playingPic = next[this.currentIndex].picUrl;
      this.getMp3Url(next[this.currentIndex].id);
    },
    // 播放上一首
    prevPlay: function () {
      var prev = JSON.parse(this.storage.getItem('playerList'));
      if (this.currentIndex === 0) {
        alert('这已经是第一首了');
        return false;
      } else {
        this.currentIndex = --this.currentIndex;
      }
      this.playingTitle = prev[this.currentIndex].title;
      this.playingArtist = prev[this.currentIndex].artists;
      this.playingPic = prev[this.currentIndex].picUrl;
      this.getMp3Url(prev[this.currentIndex].id);
    },
    // 列表循环播放
    autoNextPlay: function () {
      var lyricContainer = document.querySelector('#lyricContainer');
      lyricContainer.style.top = 110 + 'px';
      var obj = JSON.parse(this.storage.getItem('playerList'));
      if ((this.currentIndex + 1) == obj.length) {
        this.currentIndex = 0;
      } else {
        this.currentIndex = ++this.currentIndex;
      }
      if (!this.audio.loop) {
        this.playingTitle = obj[this.currentIndex].title;
        this.playingArtist = obj[this.currentIndex].artists;
        this.playingPic = obj[this.currentIndex].picUrl;
        this.getMp3Url(obj[this.currentIndex].id);
      }
    },
    // 获取MP3链接
    getMp3Url: function (id) {
      this.$http.get('api/mp3url.php', {
          params: {
            'id': id
          }
        })
        .then(function (response) {
          var mp3 = response.body.data[0];
          switch (mp3.code) {
          case 404:
            alert('因版权问题，歌曲已被下架！');
            break;
          case -110:
            alert('此歌曲需要付费！无法播放！');
            break;
          default:
            this.getSongLyric(id);
            this.audio.src = mp3.url;
            this.audio.play();
            this.isPlay = true;
          }
        }, function (error) {
          console.log(error);
        });
    },
    // 获取歌词
    getSongLyric: function (id) {
      this.$http.get('api/lyric.php', {
          params: {
            'id': id
          }
        })
        .then(function (response) {
          var lrc = response.body;
          if (lrc.nolyric === true) {
            this.lyricText = '纯音乐 无歌词';
            this.lyric = [];
            return false;
          } else if (lrc.uncollected === true) {
            this.lyricText = '未收录歌词';
            this.lyric = [];
            return false;
          }
          if (!lrc.qfy && !lrc.sfy) {
            this.lyricText = '';
            this.parseLyric(lrc.lrc.lyric);
          }
        }, function (error) {
          // error callback
          console.log(error);
        });
    },
    // 格式歌词
    parseLyric: function (text) {
      var lyric = text.split('\n'), // 先按行分割
        pattern = /\[(\d{2}):(\d{2})\.(\d{2,3})]/g,
        result = [],
        offset = this.getOffset(text); // 调用歌词偏移
      while (!pattern.test(lyric[0])) {
        lyric = lyric.slice(1);
      }
      lyric[lyric.length - 1].length === 0 && lyric.pop();
      lyric.forEach(function (v, i, a) {
        var time = v.match(pattern),
          value = v.replace(pattern, '');
        time.forEach(function (v1, i1, a1) {
          var t = v1.slice(1, -1).split(':');
          result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]) + parseInt(offset) / 1000, value]);
        });
      });
      result.sort(function (a, b) {
        return a[0] - b[0];
      });
      this.lyric = result; // 赋值给data里面的lyric用于显示歌词
    },
    // 滚动歌词实现
    updateLyric: function () {
      if (this.lyric.length === 0 || '') return false;
      var lyricContainer = document.querySelector('#lyricContainer');
      for (var i = 0, l = this.lyric.length; i < l; i++) {
        if (this.audio.currentTime > this.lyric[i][0] - 0.50) {
          var line = document.getElementById('line-' + i),
            prevLine = document.getElementById('line-' + (i > 0 ? i - 1 : i));
          prevLine.className = '';
          line.className = 'current-line';
          lyricContainer.style.top = 110 - line.offsetTop + 'px';
        }
      }
    },
    // 歌词偏移
    getOffset: function (text) {
      var offset = 0;
      try {
        var offsetPattern = /\[offset:\-?\+?\d+\]/g,
          offset_line = text.match(offsetPattern)[0],
          offset_str = offset_line.split(':')[1];
        offset = parseInt(offset_str);
      } catch (err) {
        offset = 0;
      }
      return offset;
    },
    // 上一页
    prevPage: function () {
      this.pages = this.pages - this.offset;
      this.pageNumber--;
      this.$http.get('api/pages.php', {
          params: {
            's': this.search,
            'p': this.pages
          }
        })
        .then(function (response) {
          this.songLists = response.body.result.songs;
        }, function (error) {
          // error callback
          console.log(error);
        });
    },
    // 下一页
    nextPage: function () {
      pn = this.pageNumber++;
      this.pages = pn * this.offset;
      this.$http.get('api/pages.php', {
          params: {
            's': this.search,
            'p': this.pages
          }
        })
        .then(function (response) {
          this.songLists = response.body.result.songs;
        }, function (error) {
          // error callback
          console.log(error);
        });
    },
    // 删除历史歌单歌曲
    removeList: function (index) {
      var lists = JSON.parse(this.storage.getItem('playerList')),
        changeList = lists.slice(0, index).concat(lists.slice(parseInt(index, 10) + 1));
      this.storage.setItem('playerList', JSON.stringify(changeList));
      var tempList = JSON.parse(this.storage.getItem('playerList'));
      this.playingLists = tempList;
      console.log('歌曲已从播放历史歌单中删除!');
    },
    // 点击进度条快进
    clickProgress: function (e) {
      // console.log(e);
      var percent = e.offsetX / e.target.offsetWidth,
        value = percent * this.audio.duration;
      this.audio.currentTime = value.toFixed(3);
    }
  }
});
