// Reference: javascript_object_storage blueprint
import { Storage, File } from "@google-cloud/storage";
import type { Response } from "express";
import { ObjectAclPolicy, setObjectAclPolicy, getObjectAclPolicy, ObjectPermission } from "./objectAcl";

const BUCKET_ID = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
const PRIVATE_OBJECT_DIR = process.env.PRIVATE_OBJECT_DIR || ".private";
const PUBLIC_SEARCH_PATHS = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "").split(",").filter(Boolean);

if (!BUCKET_ID) {
  throw new Error("DEFAULT_OBJECT_STORAGE_BUCKET_ID not configured");
}

export class ObjectNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ObjectNotFoundError";
  }
}

export class ObjectStorageService {
  private storage: Storage;
  private bucket: ReturnType<Storage["bucket"]>;

  constructor() {
    this.storage = new Storage();
    this.bucket = this.storage.bucket(BUCKET_ID);
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const fileName = `${PRIVATE_OBJECT_DIR}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const file = this.bucket.file(fileName);
    
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    
    return url;
  }

  normalizeObjectEntityPath(uploadURL: string): string {
    const url = new URL(uploadURL);
    return url.pathname.split("/").slice(2).join("/");
  }

  async getObjectEntityFile(path: string): Promise<File> {
    const normalizedPath = path.startsWith("/objects/") ? path.substring(9) : path;
    const file = this.bucket.file(normalizedPath);
    
    const [exists] = await file.exists();
    if (!exists) {
      throw new ObjectNotFoundError(`Object not found: ${normalizedPath}`);
    }
    
    return file;
  }

  async trySetObjectEntityAclPolicy(uploadURL: string, policy: ObjectAclPolicy): Promise<string> {
    const objectPath = this.normalizeObjectEntityPath(uploadURL);
    const file = this.bucket.file(objectPath);
    await setObjectAclPolicy(file, policy);
    return `/objects/${objectPath}`;
  }

  async canAccessObjectEntity({
    objectFile,
    userId,
    requestedPermission,
  }: {
    objectFile: File;
    userId: string;
    requestedPermission: ObjectPermission;
  }): Promise<boolean> {
    const policy = await getObjectAclPolicy(objectFile);
    
    if (!policy) {
      return false;
    }

    if (policy.visibility === "public") {
      return true;
    }

    if (policy.owner === userId) {
      return true;
    }

    return false;
  }

  async searchPublicObject(fileName: string): Promise<File | null> {
    for (const searchPath of PUBLIC_SEARCH_PATHS) {
      const fullPath = `${searchPath}/${fileName}`;
      const file = this.bucket.file(fullPath);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }

  downloadObject(file: File, res: Response): void {
    const readStream = file.createReadStream();
    readStream.on("error", (err) => {
      console.error("Error streaming file:", err);
      res.status(500).send("Error streaming file");
    });
    readStream.pipe(res);
  }
}
