import { download, upload } from "thirdweb/storage";
import { createThirdwebClient } from "thirdweb";
import { THIRD_WEB_CLIENT } from "./../constants";

export const client = createThirdwebClient({
  clientId: THIRD_WEB_CLIENT,
});

export const uploadFile = async (
  name: string,
  description: string,
  price: number,
  file: Buffer
) => {
  try {
    const imageURL = await upload({
      client,
      files: [file],
    });
    const tokenHttpURL: any = await downloadFile(imageURL);
    console.log("tokenHttpURL", tokenHttpURL);
    console.log("imageURL", imageURL);

    let imageURL2 = `https://ipfs.io/ipfs/${imageURL.split('ipfs://')[1]}`;
    console.log("Formatted Image URL:", imageURL2);

    const metaData = {
      name: name,
      description: description,
      price: price,
      image: imageURL2,
      animation_url: tokenHttpURL,
    };

    const metaDataURL = await upload({
      client,
      files: [
        new File([JSON.stringify(metaData, null, 2)], "metaData.json", {
          type: "application/json",
        }),
      ],
    });

    return metaDataURL;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

export const downloadFile = async (uri: string) => {
  try {
    const downloadURL = await download({
      client,
      uri,
    });
    return downloadURL.url;
  } catch (err) {
    console.error("Error downloading file:", err);
    throw err;
  }
};

export const prepareAssets = async (assets = []) => {
  let result: any[] = [];
  await Promise.all(assets.map(async (asset: any) => {
    try {
      let tokenHttpURL: any = await downloadFile(asset.metadata.uri);
      const response = await fetch(tokenHttpURL);
      const metaData = await response.json();
      if (metaData?.image) {
        result.push({
          address: asset.publicKey,
          name: metaData.name,
          symbol: asset.metadata.symbol,
          description: metaData.description,
          animation_url: metaData.animation_url,
          image_url: metaData.image
        });
      }
      // if (asset.metadata.uri && asset.metadata.uri.startsWith("ip")) {
      //   let tokenHttpURL: any = await downloadFile(asset.metadata.uri);
      //   const response = await fetch(tokenHttpURL);
      //   const metaData = await response.json();
      //   if (metaData?.animation_url.startsWith("https:/")) {
      //     result.push({
      //       address: asset.publicKey,
      //       name: asset.metadata.name,
      //       symbol: asset.metadata.symbol,
      //       description: metaData.description,
      //       attributes: metaData.attributes,
      //       url: metaData.animation_url
      //     });
      //   }
      // }
    } catch (e) {

    }
  }));
  console.log("result AT Index",result);
  return result
};
