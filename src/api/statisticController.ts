// @ts-ignore
/* eslint-disable */
import request from "@/request";

/** downloadFile GET /api/sta/download */
export async function downloadFileUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.downloadFileUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<any>("/api/sta/download", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** uploadAndWrite POST /api/sta/get */
export async function uploadAndWriteUsingPost(
  body: {},
  file?: File,
  options?: { [key: string]: any }
) {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === "object" && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ""));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<API.BaseResponseMapStringString_>("/api/sta/get", {
    method: "POST",
    data: formData,
    ...(options || {}),
    headers: {
      "Content-Type": "multipart/form-data", // 正确的方式
    },
  });
}
