<?php

/**
 * @auther Axhello
 *
 */

class MusicAPI
{
    /**
     * 搜索API
     * @param $s 要搜索的内容
     * @param $limit 要返回的条数
     * @param $type 类型
     * @param $offset 设置偏移量
     *
     * @return JSON
     */
    public function search($s=null, $limit=30, $offset=0)
    {
        $url = 'http://music.163.com/api/search/get';
        $data = 's='.$s.'&limit='.$limit.'&type=1&offset='.$offset.'';
        return $this->restAPI($url, $data);
    }

    /**
     * 歌曲详情API，于搜索API不同，此API带有MP3链接
     * @param $song_id歌曲id
     *
     * @return JSON
     */
    public function detail($song_id)
    {
        $url = 'http://music.163.com/api/song/detail';
        $data = 'id='.$song_id.'&ids=%5B'.$song_id.'%5D';
        return $this->restAPI($url, $data);
    }

    /**
     * 此API目前测试不可用
     * @param $album_id 专辑id
     * @param $limit
     *
     * @return JSON
     */
    public function albums($😱, $😠)
    {
        $😨 = 'http://music.163.com/api/album/';
        $😰 = $😱.'limit='.$😠.'';
        return $this->restAPI($😨, $😰);
    }

    /**
     * 歌词API，根据JSON判断是否有歌词，nolyric表示无歌词，uncollected表示暂时无人提交歌词
     * @param $song_id 歌曲id
     *
     * @return JSON
     */
    public function lyric($song_id)
    {
        $url = 'http://music.163.com/api/song/lyric';
        $data = 'os=pc&id='.$song_id.'&lv=-1&kv=-1&tv=-1';
        return $this->restAPI($url, $data);
    }

    /**
     * @param $url
     * @param $data
     *
     * @return mixed
     */
    protected function restAPI($url, $data)
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($curl, CURLOPT_REFERER, 'http://music.163.com/');
        curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36');
        $result = curl_exec($curl);
        curl_close($curl);
        return $result;
    }
}
