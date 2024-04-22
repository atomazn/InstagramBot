import express from "express";
import process from "process";
import axios from "axios";
import * as dotenv from 'dotenv'
dotenv.config()

const app = express();

const instaBusinessId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

// コンテナIDを取得する関数
async function postApi() {
    var rakutenRankingUrl = "https://app.rakuten.co.jp/services/api/IchibaItem/Ranking/20220601?applicationId="
        + process.env.RAKUTEN_APP_ID + "&sex=1&carrier=1&page=34&affiliateId=" + process.env.RAKUTEN_AFFILIATE_ID;
    console.log(rakutenRankingUrl);
    const instagramMediaUrl = `https://graph.facebook.com/v19.0/${instaBusinessId}/media?`;
    console.log(instagramMediaUrl);

    const headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
    };
    var groupContainerId = "";

    await axios.get(rakutenRankingUrl, {
    }).then(async (response) => {
        if (response.status !== 201) {
            var random = Math.floor(Math.random() * (response.data.Items.length));
            var catchcopy = response.data.Items[random].Item.catchcopy;
            var imageUrls = response.data.Items[random].Item.mediumImageUrls;
            var affiliateUrl = response.data.Items[random].Item.affiliateUrl;
            var affiliateUrl = response.data.Items[random].Item.affiliateUrl;            
            var itemName = response.data.Items[random].Item.itemName;
            var itemPrice = response.data.Items[random].Item.itemPrice;
            console.log(catchcopy);
            console.log(affiliateUrl);
            console.log(itemName);
            console.log(itemPrice);
            console

            let contenaIds = [];
            for (var i = 0; i < imageUrls.length; i++) {
                console.log(imageUrls[i])
                var imageUrl = imageUrls[i].imageUrl.substring(0, imageUrls[i].imageUrl.indexOf("?"));
                const postData = {
                    image_url: imageUrl,//画像の場合変数がimage_url、動画の場合はvideo_urlにする
                    media_type: '', //画像だけの投稿なら空、動画だけの投稿なら値をREELS、ストーリーなら値をSTORIESにする
                    is_carousel_item: true,
                }
                console.log(imageUrl);

                // Instagram 1 コンテナID取得(件数分)
                await axios.post(instagramMediaUrl, postData, {
                    headers: headers
                }).then(async (response) => {
                    if (response.status !== 201) {
                        // console.log(response);
                        console.log("Instagram 1成功");
                        const data = response.data;
                        const containerId = data.id
                        console.log(containerId);
                        contenaIds.push(containerId);
                    }
                }).catch((error) => {
                    console.log(error)
                    console.log("Instagram 1エラー");
                });
            }

            // Instagram 2 グループコンテナID取得
            await axios.post(instagramMediaUrl, {
                media_type: 'CAROUSEL',
                caption: "【" + itemPrice + "円】 " + itemName + " " + catchcopy + ' #楽天 #楽天roomに載せています #欲しい #ショッピング #楽天市場 #フォロー #フォロバ #love #followme #wish',
                children: contenaIds
            }, {
                headers: headers
            }).then(async (response) => {
                if (response.status !== 201) {
                    // console.log(response);
                    console.log("Instagram 2成功");
                    const data = response.data;
                    groupContainerId = data.id
                    console.log("Group Container ID: " + groupContainerId);
                }
            }).catch((error) => {
                console.log(error)
                console.log("Instagram 2エラー");
            });

            // Instagram 3 投稿公開
            var instagramPublishUrl = `https://graph.facebook.com/v19.0/${instaBusinessId}/media_publish?`
            await axios.post(instagramPublishUrl, {
                creation_id: groupContainerId
            }, {
                headers: headers
            }).then(async (response) => {
                if (response.status !== 201) {
                    // console.log(response);
                    console.log("Instagram 3成功");
                    const data = response.data;
                    console.log(data);
                }
            }).catch((error) => {
                console.log(error)
                console.log("Instagram 3エラー");
            });

        }
    }).catch((error) => {
        console.log(error)
    });

}


app.get("/post", (req, res) => {
    try {
        postApi();
    } catch (err) {
        console.log(err);
    }
    res.send('get');
});

app.get("/", (req, res) => {
    try {
        console.log("ログ定期実行")
    } catch (err) {
        console.log(err);
    }
    res.send('get');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);