var app = new Vue({
    el: 'body',
    data: function() {
        return {
            audio: document.createElement('audio'),
            lyricContainer: document.getElementById('lyricContainer'),
            storage: window.localStorage,
            range: 0,
            progress: 0,
            playingTitle: '',
            playingArtist: '',
            picUrl: '',
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
            goSearch: false,
            isMove: false,
            isSearch: false,
            isNull: false,
        }
    },
    created: function() {
        setInterval(this.setProgress, 500);
        this.audio.addEventListener("timeupdate", this.updateLyric);
        this.audio.addEventListener("ended", this.autoNextPlay);
        this.firstOrCreate();
    },
    methods: {
        firstOrCreate: function() {
            this.playingLists = JSON.parse(this.storage.getItem('playerList'));
            if (this.playingLists === null || this.playingLists.length == 0) {
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
            this.playingTitle = this.playingLists[0].title;
            this.playingArtist = this.playingLists[0].artists;
            this.picUrl = this.playingLists[0].picUrl;
            this.$http.get('api/mp3url.php', {
                'id': this.playingLists[0].id
            }).then(function(response) {
                var mp3 = response.data.data[0];
                this.audio.src = mp3.url;
            }, function(error) {
                console.log(error)
            });
        },
        gotoSearch: function() {
            this.goSearch = true;
            document.querySelector('input[name="search"]').focus();
        },
        setAutoPlay: function() {
            this.audio.autoplay = !this.audio.autoplay;
            alert(this.audio.autoplay);
        },
        setPlay: function() {
            if (this.audio.paused) {
                this.audio.play();
                this.isPlay = true;
            } else {
                this.audio.pause();
                this.isPlay = false;
            }
        },
        getMp3Url: function(id) {
            this.$http.get('api/mp3url.php', {
                'id': id
            }).then(function(response) {
                var mp3 = response.data.data[0];
                if (mp3.code === 404) {
                    alert('无法播放，歌曲被“和谐”了');
                    this.isNull = true;
                    return false
                } else {
                    this.isNull = false;
                    this.audio.src = mp3.url;
                    this.getSongLyric(id);
                    this.audio.play();
                }
            }, function(error) {
                console.log(error)
            });
        },
        setMtuted: function() {
            this.audio.muted = !this.audio.muted;
            this.isMuted = this.audio.muted;
        },
        setLoop: function() {
            this.audio.loop = !this.audio.loop;
            alert(this.audio.loop);
        },
        setVolume: function() {
            this.audio.volume = this.range;
            if (this.audio.volume === 0) {
                this.isMuted = true;
            } else {
                this.isMuted = false;
            }
        },
        isListOpen: function() {
            this.listOpen = !this.listOpen
        },
        setProgress: function() {
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
        formSubmit: function() {
            this.goSearch = true;
            if (this.search == '') {
                return false;
            }
            this.$http.get('api/search.php', {
                's': this.search
            }).then(function(data) {
                this.songLists = data.data.result.songs;
                this.isSearch = true;
            }, function(response) {
                // error callback
            });
        },
        playMusic: function(id) {
            this.lyricContainer.style.top = 110 + 'px';
            this.getMp3Url(id);
            this.isPlay = true;
            this.$http.get('api/detail.php', {
                'id': id
            }).then(function(data) {
                var result = data.data.songs[0];
                var id = result.id,
                    title = result.name,
                    picUrl = result.al.picUrl,
                    artists;
                if (result.ar.length == 1) {
                    artists = result.ar[0].name;
                } else if (result.ar.length == 2) {
                    artists = result.ar[0].name + '/' + result.ar[1].name
                } else if (result.ar.length == 3) {
                    artists = result.ar[0].name + '/' + result.ar[1].name + '/' + result.ar[2].name;
                } else if (result.ar.length == 4) {
                    artists = result.ar[0].name + '/' + result.ar[1].name + '/' + result.ar[2].name + '/' + result.ar[3].name;
                };
                if (!this.isNull) {
                    this.playingTitle = title;
                    this.playingArtist = artists;
                    this.picUrl = picUrl;
                    var tempData = {
                        'id': id,
                        'title': title,
                        'picUrl': picUrl,
                        'artists': artists
                    };
                    var obj = JSON.parse(this.storage.getItem('playerList'));
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
                    };
                    if (this.lock == false) {
                        this.playingLists = obj;
                        this.playingLists.push(tempData);
                        this.storage.setItem('playerList', JSON.stringify(this.playingLists));
                    } else {
                        alert('歌曲已经存在歌单中');
                        return false;
                    };
                }
            }, function(response) {
                console.log(response)
            });
        },
        playHistoryList: function(id, index) {
            this.lyricContainer.style.top = 110 + 'px';
            this.currentIndex = index;
            this.getMp3Url(id);
            this.getSongLyric(id);
            var music = JSON.parse(this.storage.getItem('playerList'));
            this.playingTitle = music[index].title;
            this.playingArtist = music[index].artists;
            this.picUrl = music[index].picUrl;
            this.isPlay = true;
        },
        nextPlay: function() {
            var next = JSON.parse(this.storage.getItem('playerList'));
            if ((this.currentIndex + 1) == next.length) {
                this.currentIndex = 0;
            } else {
                this.currentIndex = ++this.currentIndex;
            }
            this.getMp3Url(next[this.currentIndex].id);
            this.getSongLyric(next[this.currentIndex].id);
            this.playingTitle = next[this.currentIndex].title;
            this.playingArtist = next[this.currentIndex].artists;
            this.picUrl = next[this.currentIndex].picUrl;
            this.isPlay = true;
        },
        prevPlay: function() {
            var prev = JSON.parse(this.storage.getItem('playerList'));
            if (this.currentIndex == 0) {
                alert('这已经是第一首了');
                return false;
            } else {
                this.currentIndex = --this.currentIndex;
            }
            this.getMp3Url(prev[this.currentIndex].id);
            this.getSongLyric(prev[this.currentIndex].id);
            this.playingTitle = prev[this.currentIndex].title;
            this.playingArtist = prev[this.currentIndex].artists;
            this.picUrl = prev[this.currentIndex].picUrl;
            this.isPlay = true;
        },
        autoNextPlay: function() {
            this.lyricContainer.style.top = 110 + 'px';
            var obj = JSON.parse(this.storage.getItem('playerList'));
            if ((this.currentIndex + 1) == obj.length) {
                this.currentIndex = 0;
            } else {
                this.currentIndex = ++this.currentIndex;
            }
            if (!this.audio.loop) {
                this.getMp3Url(obj[this.currentIndex].id);
                this.getSongLyric(obj[this.currentIndex].id);
                this.playingTitle = obj[this.currentIndex].title;
                this.playingArtist = obj[this.currentIndex].artists;
                this.picUrl = obj[this.currentIndex].picUrl;
                this.isPlay = true;
            }
        },
        getSongLyric: function(id) {
            this.$http.get('api/lyric.php', {
                'id': id
            }).then(function(data) {
                var lrc = data.data;
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
            }, function(response) {
                // error callback
                console.log(response);
            });
        },
        parseLyric: function(text) {
            var lyric = text.split('\n'), //先按行分割
                pattern = /\[(\d{2}):(\d{2})\.(\d{2,3})]/g,
                result = [],
                offset = this.getOffset(text);
            while (!pattern.test(lyric[0])) {
                lyric = lyric.slice(1);
            };
            lyric[lyric.length - 1].length === 0 && lyric.pop();
            lyric.forEach(function(v, i, a) {
                var time = v.match(pattern),
                    value = v.replace(pattern, '');
                time.forEach(function(v1, i1, a1) {
                    var t = v1.slice(1, -1).split(':');
                    result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]) + parseInt(offset) / 1000, value]);
                });
            });
            result.sort(function(a, b) {
                return a[0] - b[0];
            });
            this.lyric = result; //赋值给data里面的lyric用于做歌词偏移
        },
        updateLyric: function() {
            if (this.lyric.length === 0 || '') return false;
            for (var i = 0, l = this.lyric.length; i < l; i++) {
                if (this.audio.currentTime > this.lyric[i][0] - 0.50) {
                    var line = document.getElementById('line-' + i),
                        prevLine = document.getElementById('line-' + (i > 0 ? i - 1 : i));
                    prevLine.className = '';
                    line.className = 'current-line';
                    this.lyricContainer.style.top = 110 - line.offsetTop + 'px';
                };
            };
        },
        getOffset: function(text) {
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
        prevPage: function() {
            this.pages = this.pages - this.offset;
            this.pageNumber--;
            this.$http.get('api/pages.php', {
                's': this.search,
                'p': this.pages
            }).then(function(data) {
                this.songLists = data.data.result.songs;
            }, function(response) {
                console.log(response)
            });
        },
        nextPage: function() {
            p = this.pageNumber++;
            this.pages = p * this.offset;
            this.$http.get('api/pages.php', {
                's': this.search,
                'p': this.pages
            }).then(function(data) {
                var result = data.data.result;
                this.songLists = result.songs;
            }, function(response) {
                // error callback
            });
        },
        removeList: function(index) {
            var lists = JSON.parse(this.storage.getItem('playerList')),
                changeList = lists.slice(0, index).concat(lists.slice(parseInt(index, 10) + 1));
            this.storage.setItem('playerList', JSON.stringify(changeList));
            var tempList = JSON.parse(this.storage.getItem('playerList'));
            this.playingLists = tempList;
            console.log('歌曲已从播放历史歌单中删除!');
        },
        clickProgress: function(e) {
            console.log(e);
            var percent = e.offsetX / e.target.offsetWidth,
                value = percent * this.audio.duration;
            this.audio.currentTime = value.toFixed(3);
        },
    }
})
