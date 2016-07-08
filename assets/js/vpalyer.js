new Vue({
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
            nextIndex: 0,
            prevIndex: 0,
            index: 0,
            search: '',
            lyricText: '',
            lyric: [],
            songLists: [],
            playingLists: [],
            pageNumber: 1,
            pages: 0,
            offset: 30,
            next: false,
            isNext: false,
            lock: false,
            listOpen: false,
            isMuted: false,
            isPlay: false,
            goSearch: false,
            isMove: false,
        }
    },
    ready: function() {
        setInterval(this.setProgress, 500);
        this.audio.addEventListener("timeupdate", this.updateLyric);
        this.audio.addEventListener("ended", this.autoNextPlay);
        this.firstOrCreate();
    },
    methods: {
        firstOrCreate: function() {
            if (this.storage.getItem('listObject') === null) {
                var tmp = {
                    'id': 1,
                    'title': 'Hero',
                    'url': 'http://m2.music.126.net/_KADwB6cWxOYG2SEgxZXEQ==/3286440264124875.mp3',
                    'picUrl': 'http://p3.music.126.net/iZOGOeVEHz0fmEV4qpUjow==/1421668538040772.jpg',
                    'artists': 'SmK'
                };
                this.playingLists.push(tmp);
                this.storage.setItem('listObject', JSON.stringify(this.playingLists));
            }
            this.playingLists = JSON.parse(this.storage.getItem('listObject'));
            this.audio.src = this.playingLists[0].url;
            this.audio.volume = 0.5;
            this.playingTitle = this.playingLists[0].title;
            this.playingArtist = this.playingLists[0].artists;
            this.picUrl = this.playingLists[0].picUrl;
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
                this.isNext = true;
            }, function(response) {
                // error callback
            });
        },
        playMusic: function(id) {
            this.lyricContainer.style.top = 110 + 'px';
            this.getSongLyric(id);
            this.$http.get('api/detail.php', {
                'id': id
            }).then(function(data) {
                var result = data.data.songs[0];
                var id = result.id,
                    title = result.name,
                    url = result.mp3Url,
                    picUrl = result.album.picUrl,
                    artists;
                if (url === null) { console.log('歌曲链接不存在了'); return false}
                if (result.artists.length === 1) {
                    artists = result.artists[0].name;
                } else if (result.artists.length === 2) {
                    artists = result.artists[0].name + '/' + result.artists[1].name
                } else if (result.artists.length === 3) {
                    artists = result.artists[0].name + '/' + result.artists[1].name + '/' + result.artists[2].name;
                };
                this.playingTitle = title;
                this.playingArtist = artists;
                this.picUrl = picUrl;
                this.audio.src = url;
                this.audio.play();
                if (!this.audio.paused) { this.isPlay = true; }
                var mdata = {
                    'id': id,
                    'title': title,
                    'url': url,
                    'picUrl': picUrl,
                    'artists': artists
                };
                var obj = JSON.parse(this.storage.getItem('listObject'));
                this.currentIndex = obj.length;
                if (obj === null) {
                    this.playingLists.push(mdata);
                    this.storage.setItem('listObject', JSON.stringify(this.playingLists));
                } else {
                    for (var i = 0; i < obj.length; i++) {
                        if (mdata.url === obj[i].url) {
                            this.lock = true;
                            break;
                        } else {
                            this.lock = false;
                        }
                    };
                    if (this.lock == false) {
                        this.playingLists = obj;
                        this.playingLists.push(mdata);
                        this.storage.setItem('listObject', JSON.stringify(this.playingLists));
                    } else {
                        console.log('歌曲已经存在歌单中');
                    };
                }
            }, function(response) {
                // error callback
                console.log(response);
            });
        },
        playHistoryList: function(id, index) {
            this.lyricContainer.style.top = 110 + 'px';
            this.currentIndex = index;
            this.getSongLyric(id);
            this.$http.get('api/detail.php', {
                'id': id
            }).then(function(data) {
                var artists, music = data.data.songs[0];
                this.audio.src = music.mp3Url;
                setTimeout(this.setPlay, 1500);
                if (!this.audio.paused) { this.isPlay = true }
                if (music.artists.length === 1) {
                    artists = music.artists[0].name;
                } else if (music.artists.length === 2) {
                    artists = music.artists[0].name + '/' + music.artists[1].name
                } else if (music.artists.length === 3) {
                    artists = music.artists[0].name + '/' + music.artists[1].name + '/' + music.artists[2].name;
                };
                this.playingTitle = music.name;
                this.playingArtist = artists;
                this.picUrl = music.album.picUrl;
            }, function(response) {
                // error callback
                console.log(response);
            });
        },
        nextPlay: function() {
            this.nextIndex = ++this.currentIndex;
            var obj = JSON.parse(this.storage.getItem('listObject'));
            this.audio.pause();
            this.audio.src = obj[this.nextIndex].url;
            this.audio.load();
            this.getSongLyric(obj[this.nextIndex].id);
            this.playingTitle = obj[this.nextIndex].title;
            this.playingArtist = obj[this.nextIndex].artists;
            this.picUrl = obj[this.nextIndex].picUrl;
            setTimeout(this.setPlay, 2000);
            if (!this.audio.paused) { this.isPlay = true }
        },
        prevPlay: function() {
            this.prevIndex = --this.currentIndex;
            var obj = JSON.parse(this.storage.getItem('listObject'));
            this.audio.pause();
            this.audio.src = obj[this.prevIndex].url;
            this.audio.load();
            this.getSongLyric(obj[this.prevIndex].id);
            this.playingTitle = obj[this.prevIndex].title;
            this.playingArtist = obj[this.prevIndex].artists;
            this.picUrl = obj[this.prevIndex].picUrl;
            setTimeout(this.setPlay, 2000);
            if (!this.audio.paused) { this.isPlay = true }
        },
        autoNextPlay: function() {
            this.lyricContainer.style.top = 110 + 'px';
            var obj = JSON.parse(this.storage.getItem('listObject'));
            this.index = ++this.currentIndex;
            if (this.index == obj.length) {
                this.currentIndex = 0;
                this.index = 0;
            }
            if (!this.audio.loop) {
                this.getSongLyric(obj[this.index].id);
                this.audio.pause();
                this.audio.src = obj[this.index].url;
                this.audio.load();
                this.playingTitle = obj[this.index].title;
                this.playingArtist = obj[this.index].artists;
                this.picUrl = obj[this.index].picUrl;
                setTimeout(this.setPlay, 2000);
            }
            if (!this.audio.paused) { this.isPlay = true }
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
                // error callback
                console.log(response);
            });
        },
        nextPage: function() {
            this.next = true;
            p = this.pageNumber++;
            this.pages = p * this.offset;
            this.$http.get('api/pages.php', {
                's': this.search,
                'p': this.pages
            }).then(function(data) {
                this.songLists = data.data.result.songs;
            }, function(response) {
                // error callback
            });
        },
        removeList: function(index) {
            var lists = JSON.parse(this.storage.getItem('listObject')),
                changeList = lists.slice(0, index).concat(lists.slice(parseInt(index, 10) + 1));
            this.storage.setItem('listObject', JSON.stringify(changeList));
            var tempList = JSON.parse(this.storage.getItem('listObject'));
            this.playingLists = tempList;
            console.log('歌曲已从播放历史歌单中删除!');
        },
        clickProgress: function(e) {
            console.log(e.offsetX);
            var percent = e.offsetX / e.target.offsetWidth;
            this.audio.currentTime = percent * this.audio.duration;
        },
    }
})
