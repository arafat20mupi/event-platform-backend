import { Request } from "express";
import prisma from "../../../shared/prisma";
import { Event } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploader";

// JWT decoded user type
type JwtUser = {
  email: string;
  role: string;
  iat: number;
  exp: number;
};

// Express Request + Multer file + Auth user
type MulterRequest = Request & {
  file?: Express.Multer.File;
  user?: JwtUser;
};

// Body type (ফ্রন্টএন্ড থেকে যা আসবে – data ফিল্ডের মধ্যে JSON)
type CreateEventBody = {
  title: string;
  location: string;
  date: string;
  type: string;
  description?: string;
  fee?: string | number;
  // hostId আর লাগবে না
  image?: string;
  maxParticipants?: string | number;
  minParticipants?: string | number;
  status?: string;
  categoryName: string;
};

const createEvents = async (req: MulterRequest): Promise<Event> => {
  const user = req.user;
  console.log(req.file, req.body, user);

  // 1) must be authenticated
  if (!user) {
    throw new Error("Unauthorized: user not found in request");
  }

  // optional: role check
  if (user.role !== "HOST") {
    throw new Error("Only hosts can create events");
  }

  // 2) Parse JSON sent as string (multipart/form-data → data ফিল্ডে পাঠানো হয়েছে)
  if ((req.body as any).data) {
    req.body = JSON.parse((req.body as any).data);
  }

  const {
    title,
    location,
    date,
    type,
    description,
    fee,
    maxParticipants,
    minParticipants,
    status,
    categoryName,
  } = req.body as CreateEventBody;

  // 3) Host বের করো logged-in user এর email দিয়ে
  const host = await prisma.host.findUnique({
    where: { email: user.email },
  });

  if (!host) {
    throw new Error("Host profile not found for this user");
  }

  // 4) File upload (optional)
  const file = req.file;
  let imageUrl: string | undefined = undefined;

  if (file) {
    const uploadedImage = await fileUploader.uploadToCloudinary(file);
    imageUrl = uploadedImage?.secure_url;
  }

  // 5) Date parse
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format");
  }

  // 6) Numeric fields normalize
  const parsedFee =
    typeof fee === "string" || typeof fee === "number"
      ? Number(fee)
      : undefined;

  const parsedMaxParticipants =
    typeof maxParticipants === "string" || typeof maxParticipants === "number"
      ? Number(maxParticipants)
      : undefined;

  const parsedMinParticipants =
    typeof minParticipants === "string" || typeof minParticipants === "number"
      ? Number(minParticipants)
      : undefined;

  // 7) Prisma create
  const newEvent = await prisma.event.create({
    data: {
      title,
      description,
      location,
      date: parsedDate,
      type,
      fee: parsedFee,
      image: imageUrl,
      maxParticipants: parsedMaxParticipants,
      minParticipants: parsedMinParticipants,
      status,

      host: {
        connect: { id: host.id }, // এখন আর undefined হবে না
        // অথবা যদি Host.email @unique থাকে:
        // connect: { email: user.email }
      },

      category: {
        connect: { name: categoryName }, // name @unique হতে হবে
      },
    },
  });

  return newEvent;
};

const getEvents = async (): Promise<Event[]> => {
  const events = await prisma.event.findMany({
    include: {
      category: true,
      host: true,
    },
  });
  return events;
};

export const eventsService = {
  createEvents,
  getEvents,
};
