<template>
  <div class="clearfix">
    <a-upload
      :file-list="fileList"
      :before-upload="beforeUpload"
      :multiple="false"
      @remove="handleRemove"
    >
      <a-button>
        <upload-outlined></upload-outlined>
        Select File
      </a-button>
    </a-upload>
    <a-button
      type="primary"
      :disabled="fileList.length === 0"
      :loading="uploading"
      style="margin-top: 16px"
      @click="handleUpload"
    >
      {{ uploading ? "Uploading" : "Start Upload" }}
    </a-button>

    <!-- 添加下载区域 -->
    <div v-if="downloadLinks" class="download-area">
      <a-card title="生成的文件" style="margin-top: 16px">
        <a-space direction="vertical">
          <a-button type="link" @click="downloadFile(downloadLinks.sign)">
            <download-outlined />
            下载签到表
          </a-button>
          <a-button type="link" @click="downloadFile(downloadLinks.detail)">
            <download-outlined />
            下载详情表
          </a-button>
        </a-space>
      </a-card>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import { UploadOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import type { UploadProps, UploadFile } from "ant-design-vue";
import {
  downloadFileUsingGet,
  uploadAndWriteUsingPost,
} from "@/api/statisticController";

const fileList = ref<UploadFile[]>([]);
const uploading = ref<boolean>(false);
const downloadLinks = ref<{ sign: string; detail: string } | null>(null);
const handleUpload = async () => {
  try {
    if (fileList.value.length === 0) {
      message.error("请选择文件");
      return;
    }

    uploading.value = true;

    const file = fileList.value[0];
    const uploadFile = file.originFileObj || file;

    // 调用 API 时传入正确的参数
    const res = await uploadAndWriteUsingPost(
      {}, // body 参数为空对象
      uploadFile as File, // 传入文件
      {
        onUploadProgress: (progressEvent: any) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log("上传进度:", percent);
        },
      }
    );

    if (res.data.code === 0) {
      fileList.value = [];
      message.success("上传成功");
      console.log("返回数据:", res.data.data);
      // 保存下载链接
      downloadLinks.value = res.data.data;
    } else {
      throw new Error(res.data.message || "上传失败");
    }
  } catch (error) {
    console.error("上传错误:", error);
  } finally {
    uploading.value = false;
  }
};

const beforeUpload: UploadProps["beforeUpload"] = (file) => {
  const isExcel =
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel";
  if (!isExcel) {
    message.error("只能上传 Excel 文件！");
    return false;
  }

  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error("文件必须小于 10MB！");
    return false;
  }

  fileList.value = [
    {
      uid: "-1",
      name: file.name,
      status: "ready",
      size: file.size,
      type: file.type,
      originFileObj: file,
    },
  ];

  return false;
};

const handleRemove = (file: UploadFile) => {
  fileList.value = [];
};

// eslint-disable-next-line no-undef
const downloading = reactive({
  sign: false,
  detail: false,
});
// 下载文件函数
const downloadFile = async (filePath: string) => {
  const type = filePath.includes("sign") ? "sign" : "detail";
  if (downloading[type]) return;

  downloading[type] = true;
  try {
    message.loading({ content: "正在下载...", key: "download" });

    const response = await downloadFileUsingGet(
      { filePath },
      {
        responseType: "blob", // 设置响应类型为blob
        timeout: 60000, // 增加超时时间
      }
    );

    // 从响应中获取文件名
    const fileName = type === "sign" ? "sign.docx" : "detail.xlsx";

    // 创建 Blob 对象
    const blob = new Blob([response.data], {
      type: "application/octet-stream", // 使用与后端一致的类型
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    message.success({ content: "下载成功", key: "download" });
  } catch (error) {
    console.error("下载错误:", error);
    message.error({ content: "下载失败", key: "download" });
  } finally {
    downloading[type] = false;
  }
};
</script>
