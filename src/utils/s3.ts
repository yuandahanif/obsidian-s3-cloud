import { S3CloudSettings } from "@/types/settings";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const allowedContentTypes = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/apng",
];

export class S3ClientWeapper {
	settings: S3CloudSettings;
	private client: S3Client;

	constructor(settings: S3CloudSettings) {
		this.settings = settings;

		this.client = new S3Client({
			region: "auto",
			endpoint: `https://${settings.cloudflare_worker_endpoint}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: settings.s3_accessKeyId,
				secretAccessKey: settings.s3_secretAccessKey,
			},
		});
	}

	async uploadFile(form: FormData) {
		try {
			const file = form.get("file") as File;

			if (!file) {
				throw new Error("No file provided");
			}

			if (!allowedContentTypes.includes(file.type.toLowerCase())) {
				throw new Error("Invalid file type");
			}

			const matches = file.name.match(/^(.+)\.([^.]+)$/);

			if (!matches) {
				throw new Error("Invalid file name");
			}

			const uuid = crypto.randomUUID();
			const fileName = matches[1] ?? "";
			const extension = matches[2] ?? "";

			const Key = `obsidian/${fileName
				.split(" ")
				.join("_")}-${uuid}.${extension}`;
			const Body = (await file.arrayBuffer()) as Buffer;
			const ContentType = file.type;

			const command = new PutObjectCommand({
				Bucket: this.settings.s3_bucket,
				ACL: "public-read",
				ContentType,
				Body,
				Key,
			});
			const response = await this.client.send(command);
			console.log(response);
		} catch (error) {
			console.error("Error while uploading file", error);
		}
	}

	async getUrlByKey(key: string) {
		try {
			return `${this.settings.cloudflare_worker_endpoint}/${key}`;
		} catch (error) {
			console.error("Error while getting file by key", error);
		}
	}
}
