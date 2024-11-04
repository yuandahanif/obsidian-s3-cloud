export interface S3CloudSettings {
	s3_accessKeyId: string;
	s3_secretAccessKey: string;
	s3_region: string;
	s3_bucket: string;

	local_directory: string;
	local_db_name: string;
	local_when_delete: "delete" | "move_to_trash";

	cloudflare_worker_endpoint: string;
	cludflare_r2_account_id: string;
}
