// src/modules/user/user.service.ts
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import config from '../../../config';

import { fileUploader } from '../../../helpers/fileUploader';
import prisma from '../../../shared/prisma';
import { Admin, Host, Prisma, User, UserRole, UserStatus } from '@prisma/client';
import { IAuthUser } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { userSearchAbleFields } from './user.constant';

const createUser = async (req: Request): Promise<User> => {
  const file = req.file;
  if (file) {
    const uploadedProfileImage = await fileUploader.uploadToCloudinary(file);
    req.body.user.profileImage = uploadedProfileImage?.secure_url;
  }


  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(config.salt_round)
  );

  const userData: Prisma.UserCreateInput = {
    name: req.body.user.name,
    email: req.body.user.email,
    password: hashedPassword,
    role: UserRole.USER,
    profileImage: req.body.user.profileImage, // optional
  };

  const newUser = await prisma.user.create({
    data: userData,
  });

  return newUser;
};

const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req.file;

  if (file) {
    const uploadedProfileImage = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profileImage = uploadedProfileImage?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(config.salt_round)
  );

  const userData: Prisma.UserCreateInput = {
    name: req.body.admin.name,
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
    profileImage: req.body.admin.profileImage,
    interests: [], // চাইলে req.body.admin.interests ও দিতে পারো
  };

  const result = await prisma.$transaction(async (tx) => {
    // ১) আগে user তৈরি করো
    await tx.user.create({
      data: userData,
    });

    // ২) এখন সেই user–এর সাথে Admin কে relate করে দাও (email দিয়ে connect)
    const createdAdmin = await tx.admin.create({
      data: {
        name: req.body.admin.name,
        profileImage: req.body.admin.profileImage,
        contactNumber: req.body.admin.contactNumber,
        user: {
          connect: {
            email: req.body.admin.email,
          },
        },
      },
    });

    return createdAdmin;
  });

  return result;
};



const createHost = async (req: Request): Promise<Host> => {
  const file = req.file;
  const {
    name,
    bio,
    location,
    email,
    contactNumber,
    isVerified,
    isDeleted,
  } = req.body.Host;

  let profileImage: string | undefined = undefined;
  // Profile image upload
  if (file) {
    const uploadedImage = await fileUploader.uploadToCloudinary(file);
    profileImage = uploadedImage?.secure_url;
    console.log("Uploaded Image:", profileImage);
  }

  // Hash password
  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(config.salt_round)
  );

  // USER table data
  const userData: Prisma.UserCreateInput = {
    name,
    email,
    password: hashedPassword,
    role: UserRole.HOST,
    profileImage,
  };

  // TRANSACTION: create User -> create Host
  const result = await prisma.$transaction(async (tx) => {
    // Step 1️⃣: Create User
    await tx.user.create({
      data: userData,
    });

    // Step 2️⃣: Create Host + connect by email
    const createdHost = await tx.host.create({
      data: {
        displayName: name,
        bio,
        location,
        profileImage,
        contactNumber,
        isVerified: isVerified || true,
        isDeleted: isDeleted || false,

        // Relation (IMPORTANT)
        user: {
          connect: {
            email,
          },
        },
      },
    });

    return createdHost;
  });

  return result;
};


const getAllFromDB = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
          [options.sortBy]: options.sortOrder,
        }
        : {
          createdAt: 'desc',
        },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      name: true,
      profileImage: true,
      reviewsGiven: true,
      reviewsReceived: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getAllHostsFromDB = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andConditions: Prisma.HostWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.HostWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.host.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
          [options.sortBy]: options.sortOrder,
        }
        : {
          createdAt: 'desc',
        },
    select: {
      id: true,
      displayName: true,
      bio: true,
      location: true,
      profileImage: true,
      contactNumber: true,
      isVerified: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
      email: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          name: true,
        },
      }
    },
  });
  const total = await prisma.host.count({
    where: whereConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
}

// এখানে status আসলে UserStatus হবে, UserRole না
const changeProfileStatus = async (id: string, status: UserStatus) => {
  // Optional: user আছে কি না নিশ্চিত হওয়া
  await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status }, // আগে এখানে ভুল ছিল
  });

  return updatedUser;
};

const getMyProfile = async (user: IAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });

  const profileInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: userInfo.email,
    },
    select: {
      name: true,
      profileImage: true,
      reviewsGiven: true,
      reviewsReceived: true,
    },
  });

  return { ...userInfo, ...profileInfo };
};

const updateMyProfile = async (user: IAuthUser, req: Request) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const file = req.file;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.profileImage = uploadToCloudinary?.secure_url;
  }

  const updatedProfile = await prisma.user.update({
    where: {
      email: userInfo.email,
    },
    data: req.body,
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      name: true,
      profileImage: true,
    },
  });

  return updatedProfile;
};

const deleteHost = async(id: string) => {
  
}

export const userService = {
  createUser,
  createAdmin,
  createHost,
  getAllFromDB,
  getAllHostsFromDB,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile,
  deleteHost
};
