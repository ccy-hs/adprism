"""
config.py — Source definitions synced from AdPrism_Sources.csv.

Categories:
  1. Global Brands     — major global brand YouTube channels
  2. Client Industry   — Taiwan + JP/KR brand YouTube channels (client-relevant)
  3. Regional Brands   — Taiwan / JP regional brand YouTube channels
  4. Media             — Ad/marketing media & awards (RSS / YouTube RSS)
  5. Production        — Production house YouTube channels
"""

# ── Category 1: Global Brands (YouTube) ───────────────────────────
CAT1_GLOBAL_BRANDS = {
    "Apple":                    "UCE_M8A5yxnLfW0KghEeajjw",
    "Spotify":                  "UCRMqQWxCWE0VMvtUElm-rEA",
    "Uber":                     "UCgnxoUwDmmyzeigmmcf0hZA",
    "Uber Eats":                "UC1xnncYc7586km_rIYQLtLQ",
    "Coca-Cola":                "UCosXctaTYxN4YPIvI5Fpcrw",
    "McDonald's":               "UCRI5ZedBs0_BYY4PlxD6m7w",
    "BURGER KING":              "UC23ZqC2LTzl7dfOi6EmwJhg",
    "OREO Cookie":              "UCYrx7f8QvhZKKh7a0815UuA",
    "Cheetos":                  "UCUnC4wPTiAmMypWHXGwqh-Q",
    "Doritos":                  "UCGTGlZDAATNAAXINMLj4jgw",
    "Nike":                     "UCUFgkRb0ZHc4Rpq15VRCICA",
    "adidas":                   "UCuLUOxd7ezJ8c6NSLBNRRfg",
    "Cartier":                  "UCu16y62LPCwTknfV5_7Zalg",
    "LOEWE":                    "UCIkFEXV_zvjOlmOcKEHW_hg",
    "Louis Vuitton":            "UC5q0PIKGr2lGOsiT14AlEYg",
    "Hermès":                   "UCmFOnqrNg-YHLXfdB3GexBg",
    "GUCCI":                    "UCo6fjlKg6GuCmEMeqYbGJng",
    "H&M":                      "UCoc8tpGCY1wrp8pV7mI0scA",
    "CHANEL":                   "UCclHSnngVTZK7LEOQAzcg1w",
    "Calvin Klein":             "UCuf6cvFcYdpHZ_EjSIcBZlg",
    "UNIQLO ユニクロ":           "UCvm-1tfv4nk4dz_EHeRGbXw",
    "The Macallan":             "UCFgN7m_XSuPA2R__ZOxy8ew",
    "Guinness":                 "UCkXrtT9K4AuoB95wd8z92zg",
    "Heineken":                 "UC_-HWQDxWNqEimlma9cJoIA",
    "Unilever":                 "UCMVcaTH8mk0POzGBvjWa7tg",
    "SK-II":                    "UC9b7R9L0D-w1gM1bbcx1EcA",
    "John Lewis":               "UCa1yUHQmV6Z0PpAUtfgNd9g",
    "M&S":                      "UCi86xSII1cJOOwOtiefntRw",
    "MUJI 無印良品":             "UCwyYkh82ANLzQ9_7u1xHHzg",
    "Airbnb":                   "UCCww-R0oM_CQWXerBcNyKKw",
}

# ── Category 2: Client Industry (YouTube) ─────────────────────────
CAT2_CLIENT_INDUSTRY = {
    # TW - Homeware
    "PanasonicTaiwan":                              "UCuqanMfbRAMCNPDdpp8QH4g",
    "Hitachi Home Appliances Taiwan":               "UCxlZn4nsK1PBEdbEpqWYGAg",
    "日立冷氣 Hitachi Cooling & Heating Taiwan":     "UC0wK78s-Ra3peD0i4URZwqg",
    "Mitsubishi Electric Taiwan":                   "UC17dEhuNApft1h4d5bwesKA",
    "LG Taiwan":                                    "UCqrCfaSINN1l4vtRzck9YjA",
    # JP - Homeware
    "Panasonic Japan（パナソニック公式）":              "UCWfg-7LoIeXDLWb_8jpvjnA",
    # KR - Homeware
    "LG전자":                                       "UCrIAnDo3VuWex3fywkGpB1g",
    # Global - Homeware
    "Hitachi":                                      "UC1uLQAHSG6VXSypf5ng-hCQ",
    # TW - Technology
    "SamsungTaiwan":                                "UCXvg-X18i5Vv7fVpm2YSocw",
    # KR - Technology
    "삼성전자 Samsung Electronics":                   "UCYSjF7_K6jBVzYVuqrE0uZA",
    # TW - FMCG
    "台灣妙管家 Magic Amah, Taiwan":                 "UCJd9_5PfUbhKkkQ0ewAy7YA",
    "花王Kirei生活":                                 "UCbumKBdq1vbc3uYSxOADYsQ",
    "日本ARIEL抗菌洗衣專家":                          "UCq2-CqL_0YYE05n-o_09k8w",
    "台灣白蘭":                                      "UCLz5qyr9BUavpcTGIXY1R9g",
    # JP - FMCG
    "KaoJapan":                                     "UC8meHqoXa7z6I6-jiGgfL0w",
    "ライオン公式チャンネル":                          "UCXHswLLPbrpGfXQMstmLjag",
    # TW - Automotive
    "Mitsubishi Motors Taiwan":                     "UCKwgzZSwMjSOGSFeuF0yqKg",
    "Mercedes-Benz Taiwan 台灣賓士":                 "UCBoSZcLEOJ3pdv-fPgAMXag",
    "BMW Taiwan 總代理汎德":                          "UChJjCHL2LZVrzWCzBXCmzQw",
    "Volkswagen Taiwan":                            "UCvAJOkPViSm0VKMmgOjXzqw",
    "TOYOTA TW":                                    "UCBjG--Dg8yAYabPoMMOy-sA",
    "Hyundai Taiwan":                               "UCv3ROr4C1zcwttzoUvgg_Ew",
    "HondaTaiwan":                                  "UCC2Ht4Hjaxr9_CAm8dbrNFA",
    "NISSAN TAIWAN":                                "UCG41hHl1id-WMIf27kS_f7A",
    "Volvo Cars Taiwan":                            "UCQLU-7psDovTR9hKpyJm0eg",
    "Kia Taiwan":                                   "UCgR6Qxo5j0e_gBsgtzZF-LA",
    # JP - Automotive
    "MitsubishiMotorsTV":                           "UCtxwcyCF62zCXPaBj-QybMA",
    "トヨタ YouTubeショールーム":                      "UCxvxIxnS9cjPyeebbiOd4lg",
    "本田技研工業株式会社 (Honda)":                     "UC74rufV9sOK7FbiOuGAUfBA",
    "日産自動車株式会社":                              "UCW47Uio6Y_pC_0No0Reak-g",
    # KR - Automotive
    "현대자동차 (Hyundai Korea)":                      "UC_rBRrHKHnHkzgx8qIWwygg",
    "기아 (Kia Korea)":                               "UC6Im3VweLhYbiT2qYTIP6nw",
    # Global - Automotive
    "Mercedes-Benz":                                "UClj0L8WZrVydk5xKOscI6-A",
    "BMW":                                          "UCYwrS5QvBY_JbSdbINLey6Q",
    "Volkswagen":                                   "UC0US_GEXVmwMH04OMcNuhpQ",
    "HyundaiWorldwide":                             "UC5f97D60yHa7UE9rFfbej8g",
    "Nissan":                                       "UCIpK0Bh0wFnC-QqgJs6hx5w",
    "Volvo Cars":                                   "UCaY-4ndPCRKp60qXF7zBJ0w",
    # TW - Food & Beverage
    "麥當勞官方頻道 (McDonald's Taiwan)":             "UChkGH0QNU9w56CEotkNjpiA",
    "台灣肯德基KFC官方頻道":                          "UC-1c35Q_sfl90BKJpOv92jw",
    "必勝客官方頻道":                                 "UCcI1aDgkuPmTeNUUK8fp2ww",
    # UK - Food & Beverage
    "McDonald's UK":                                "UCRpqjPtyLWp51TRyi515Rlg",
    # JP - Food & Beverage
    "マクドナルド公式 (McDonald's Japan)":            "UChqSIUxTWurwjobZ9X0frtg",
    # TW - Travel
    "中華航空 (China Airlines)":                      "UCKsi-rH0Wvdu6iGQUsx3SMg",
    "STARLUX Airlines 星宇航空":                     "UCYIJbcrjtAIwqYau7lWMvng",
    "EVA Air":                                      "UCCsMx6WSgoiW9s3g4FyVFPw",
    # HK - Travel
    "cathaypacific":                                "UCDF__e4OyxESzW1snu1i0Bg",
    # JP - Travel
    "JAL 日本航空【公式】":                           "UC866LucISVOcPmrK2kvx2hg",
    # UK - Travel
    "British Airways":                              "UCSs-N1quBfssFcYyqm6V_oA",
    # Global - Travel
    "Turkish Airlines":                             "UCSK1_qvsEuTNZnvLQvNRLGQ",
    "Emirates":                                     "UCJ6jdm9qTla9Lp3Jf-TPwbg",
    # TW - Finance
    "摩根資產管理":                                  "@JPMorganTouch",
    "中國信託CTBC":                                  "UCK-qHFerEXOQG0q6yOkm_SQ",
    "國泰世華銀行":                                  "UCnJ41_Tdf65EaM8-lfWg8Hg",
    # TW - Technology
    "Sony Taiwan":                                  "@sonytaiwan",
    # JP - Technology
    "Sony Japan":                                   "@sonyjapan",
    # Global - Technology
    "Sony":                                         "@sony",
}

# ── Category 3: Regional Brands (YouTube) ─────────────────────────
CAT3_LOCAL_BRANDS = {
    # TW - Retail
    "PX Channel (全聯福利中心)":                  "UCREDuMP2Ta1Hj43ZqlPX6YA",
    "IKEA Taiwan 宜家家居":                       "UC1_smvBtFP2C-f9_DHn-rYw",
    # TW - Technology
    "蝦皮購物":                                  "UC9wQHnWHsAzv6TRdG4R86Kg",
    # TW - Alcohol
    "The Macallan麥卡倫單一麥芽威士忌":            "UC_nW9nwTu5agdWe0Ptag9gA",
    "HeinekenTW":                                "UC-146HGOCaLgv9T7mHwtb0A",
    "台灣啤酒 Taiwan Beer":                       "UCWntOyIhrGQzKTiaiuLBlxQ",
    # JP - Food & Beverage
    "日清食品グループ公式チャンネル (NISSIN)":       "UC_Mqb6toM3tO8aAD6Q5HXvA",
    # TW - Food & Beverage
    "樂事":                                       "UCC8hmK0guS6zpKn3lZPpENg",
    "Doritos Taiwan":                             "UCE7bErj9SxHvCc4njc-MSaQ",
    # TW - Fashion
    "UniqloTaiwan":                              "UCnhbHFASF1aaCMqqxtIlu4w",
    # JP - FMCG
    "大塚製薬 公式チャンネル":                      "UCOgqmqpvV9wIjcXbhb6Ee6Q",
    # TW - FMCG
    "Dove Taiwan":                               "UC5uoI10oVca2CJ1loouD5AA",
    # US - FMCG
    "Dove US":                                   "UC0uGC_EBwAxw3ljqeGjy2qw",
    # TW - FMCG
    "SK-II Taiwan":                              "UC6PikCyA4o4-ZC9YR1GDHmA",
    # JP - FMCG
    "SK-II Japan":                               "UC1pLeaDml5ESomtqkR_yR4A",
    "資生堂 Shiseido Co. Ltd.":                   "UCrgHdSQWAXEv1QZpzgrJHnA",
    # TW - Finance
    "台新新光金控 TS Holdings":                     "UCUBjCFAhx9zlUCMVVQpuxLA",
    # TW - Homeware
    "TOTO台灣東陶":                               "UCr34gQo0Xucxamavu8v5wEA",
}

# ── Category 4: Media (RSS / YouTube) ─────────────────────────────
CAT4_MEDIA = {
    # Awards (RSS)
    "Spikes Asia":                     "https://www.spikes.asia/feed",
    "The One Show":                    "https://www.oneshow.org/feed",
    "Cannes Lions":                    "https://www.canneslions.com/feed",
    # TW media (RSS)
    "動腦雜誌 Brain Magazine":          "https://www.brain.com.tw/news/rss",
    "數位時代 Business Next":           "https://www.bnext.com.tw/search/tag?keyword=%E8%A1%8C%E9%8A%B7&type=rss",
    "INSIDE":                          "https://www.inside.com.tw/feed",
    # Global media (RSS)
    "Adweek":                          "https://www.adweek.com/feed/",
    "Marketing Week":                  "https://www.marketingweek.com/feed/",
    # APAC media (RSS)
    "Campaign Asia":                   "https://www.campaignasia.com/rss",
    # UK media (RSS)
    "Campaign UK":                     "https://www.campaignlive.co.uk/rss",
    # US media (RSS)
    "Campaign US":                     "https://www.campaignlive.com/rss",
    # Ad industry YouTube channels
    "Ads of Brands":                   "UCU5fuplXj_5gwSM6up-hHdw",
    "Ads of the World by Clios":       "UC4uBUZNkf2_CzUdBM42WuqA",
    "adsoftheworldvideos":             "UCPUBNjqHt0xJGxvvIlnHf9g",
    "오광TV":                           "UCxL-mycH-upGWCkUEjbjOeA",
    "oricon (Japanese entertainment news)": "UCbZvkG2uAgr6Oiva4FytscQ",
    "HATtokyo":                        "UChKbkOP91pWWZmEsojBn4jg",
    "廣告裁判":                          "UCM1njsns1JCqepzvwnkT-oA",
    "LLLLITL":                          "UCOS4pjUGQRB0IT4gzKBi_Bw",
    "MANTAN TV":                        "UCDE_gujqIP9wEBZy0lVH_8Q",
    "News, Sport and Commercials.":     "UCR_2neqKXxTxbMSu5OF_dnA",
}

# ── Category 5: Production (YouTube) ──────────────────────────────
CAT5_PRODUCTION = {
    "大兼制作 DJfilm":       "UCE9DXuG1RzLBLMIqc2wqrcQ",
    "The Company Films":    "UCEPT7bVLPuZ08i2yW7rFbPA",
}

# ── Brand → Industry lookup (lowercase keys) ─────────────────────
BRAND_INDUSTRY_MAP = {
    # Technology
    "apple":            "Technology",
    "spotify":          "Technology",
    "uber":             "Technology",
    "uber eats":        "Technology",
    "samsungtaiwan":    "Technology",
    "삼성전자 samsung electronics": "Technology",
    "蝦皮購物":         "Technology",
    # Homeware
    "panasonictaiwan":  "Homeware",
    "panasonic japan（パナソニック公式）": "Homeware",
    "hitachi home appliances taiwan": "Homeware",
    "日立冷氣 hitachi cooling & heating taiwan": "Homeware",
    "mitsubishi electric taiwan": "Homeware",
    "lg taiwan":        "Homeware",
    "lg전자":           "Homeware",
    "hitachi":          "Homeware",
    "toto台灣東陶":     "Homeware",
    # Sport
    "nike":             "Sport",
    "adidas":           "Sport",
    # Fashion
    "cartier":          "Fashion",
    "loewe":            "Fashion",
    "louis vuitton":    "Fashion",
    "hermès":           "Fashion",
    "gucci":            "Fashion",
    "h&m":              "Fashion",
    "chanel":           "Fashion",
    "calvin klein":     "Fashion",
    "uniqlo ユニクロ":   "Fashion",
    "uniqlotaiwan":     "Fashion",
    # Alcohol
    "the macallan":     "Alcohol",
    "guinness":         "Alcohol",
    "heineken":         "Alcohol",
    "the macallan麥卡倫單一麥芽威士忌": "Alcohol",
    "heinekentw":       "Alcohol",
    "台灣啤酒 taiwan beer": "Alcohol",
    # FMCG
    "unilever":         "FMCG",
    "sk-ii":            "FMCG",
    "台灣妙管家 magic amah, taiwan": "FMCG",
    "花王kirei生活":     "FMCG",
    "kaojapan":         "FMCG",
    "日本ariel抗菌洗衣專家": "FMCG",
    "台灣白蘭":         "FMCG",
    "ライオン公式チャンネル": "FMCG",
    "大塚製薬 公式チャンネル": "FMCG",
    "dove taiwan":      "FMCG",
    "dove us":          "FMCG",
    "sk-ii taiwan":     "FMCG",
    "sk-ii japan":      "FMCG",
    "資生堂 shiseido co. ltd.": "FMCG",
    # Retail
    "john lewis":       "Retail",
    "m&s":              "Retail",
    "muji 無印良品":    "Retail",
    "px channel (全聯福利中心)": "Retail",
    "ikea taiwan 宜家家居": "Retail",
    # Food & Beverage
    "coca-cola":        "Food & Beverage",
    "mcdonald's":       "Food & Beverage",
    "burger king":      "Food & Beverage",
    "oreo cookie":      "Food & Beverage",
    "cheetos":          "Food & Beverage",
    "doritos":          "Food & Beverage",
    "麥當勞官方頻道 (mcdonald's taiwan)": "Food & Beverage",
    "mcdonald's uk":    "Food & Beverage",
    "マクドナルド公式 (mcdonald's japan)": "Food & Beverage",
    "台灣肯德基kfc官方頻道": "Food & Beverage",
    "必勝客官方頻道":   "Food & Beverage",
    "日清食品グループ公式チャンネル (nissin)": "Food & Beverage",
    "樂事":             "Food & Beverage",
    "doritos taiwan":   "Food & Beverage",
    # Automotive
    "mitsubishi motors taiwan": "Automotive",
    "mitsubishimotorstv": "Automotive",
    "mercedes-benz taiwan 台灣賓士": "Automotive",
    "mercedes-benz":    "Automotive",
    "bmw taiwan 總代理汎德": "Automotive",
    "bmw":              "Automotive",
    "volkswagen taiwan": "Automotive",
    "volkswagen":       "Automotive",
    "toyota tw":        "Automotive",
    "トヨタ youtubeショールーム": "Automotive",
    "hyundai taiwan":   "Automotive",
    "현대자동차 (hyundai korea)": "Automotive",
    "hyundaiworldwide": "Automotive",
    "hondataiwan":      "Automotive",
    "本田技研工業株式会社 (honda)": "Automotive",
    "nissan taiwan":    "Automotive",
    "nissan":           "Automotive",
    "日産自動車株式会社": "Automotive",
    "volvo cars taiwan": "Automotive",
    "volvo cars":       "Automotive",
    "kia taiwan":       "Automotive",
    "기아 (kia korea)":  "Automotive",
    # Travel
    "airbnb":           "Travel",
    "中華航空 (china airlines)": "Travel",
    "starlux airlines 星宇航空": "Travel",
    "cathaypacific":    "Travel",
    "eva air":          "Travel",
    "jal 日本航空【公式】": "Travel",
    "british airways":  "Travel",
    "turkish airlines": "Travel",
    "emirates":         "Travel",
    # Finance
    "中國信託ctbc":      "Finance",
    "國泰世華銀行":      "Finance",
    "台新新光金控 ts holdings": "Finance",
    "摩根資產管理":      "Finance",
    # Technology (Sony)
    "sony taiwan":       "Technology",
    "sony japan":        "Technology",
    "sony":              "Technology",
}
