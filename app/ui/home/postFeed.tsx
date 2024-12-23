"use client";

import clsx from 'clsx';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, QuerySnapshot } from "firebase/firestore";
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { Post } from '@/app/lib/definitions';
import { db } from "@/firebaseConfig";
import { inter } from '../fonts';

export default function PostFeed() {
  const [items, setItems] = useState<Post[]>([]); // State to store the items
  const [userList, setUserList] = useState<{ id: string; name: string }[]>([]);

  const fetchUserUIDs = async () => {
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);

      const users = snapshot.docs.map(doc => ({
        id: doc.id, // UID
        ...doc.data(),
      })) as { id: string; name: string }[];

      setUserList(users);
      console.log("Fetched Users:", users);
    } catch (error) {
      console.error("Error fetching user UIDs:", error);
    }
  };

  const fetchAllItems = async () => {
    try {
      // Reference the "allSubmissions" collection
      const submissionsRef = collection(db, "allSubmissions");
      const q = query(submissionsRef);

      // Get documents
      const querySnapshot = await getDocs(q);

      const storedItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];

      setItems(storedItems);

      console.log("All items from allSubmissions:", storedItems);
    } catch (error) {
      console.error("Error fetching all items:", error);
      alert("Failed to fetch all items.");
    }
  };

  // Use useEffect to fetch data when the component mounts
  useEffect(() => {
    fetchAllItems();
    fetchUserUIDs();
  }, []);

  return (
    <div className="relative">
      <div className={`${inter.className} grid grid-rows-1 lg:grid-cols-5 xl:grid-cols-12`}>
        <div>

          {/* Retrieve & Diplay Post Information from Database */}
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="bg-white mx-7 rounded-lg mb-6">

                {/* Post Section */}
                <div className="flex flex-col lg:flex-row space-x-0 lg:space-x-4">
                  {/* Image */}
                  <div className="w-full lg:w-2/5 h-56 flex items-center justify-center">
                    <Image
                      src="/logo.svg"
                      alt="Logo"
                      width={0}
                      height={0}
                      style={{ width: 200, height: 'auto' }}
                      className="transition-transform duration-300 ease-in-out hover:scale-110"
                    />
                  </div>

                  {/* Post Details */}
                  <div className="flex-1 mt-4 lg:mt-0">
                    <h3 className="font-bold text-lg">{item.itemName}</h3>
                    <p className="font-medium text-gray-500">
                      {
                        userList.find(user => user.id === item.user)?.name || "Unknown User"
                      }
                    </p>
                    <p className="font-medium">Status: <span className={clsx(
                      {
                        'text-red-500 font-normal': item.status === 'Missing',
                        'text-green-500 font-normal': item.status === 'Found',
                      }
                    )}>
                      {item.status} </span>
                    </p>
                    <p className="mt-2 font-medium">Campus:<span className="font-normal">{item.campus}</span></p>
                    <p className="mt-2 font-medium">Building:<span className="font-normal">{item.building}</span></p>
                    <p className="mt-2">{item.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap space-x-2 mt-4 font-medium gap-y-2">
                      {item.tags.length > 0 ? (
                        item.tags.map((tag, index) => (
                          <span
                            key={`${tag}-${index}`}
                            className="px-3 py-1 outline outline-2 outline-red-500 rounded-full text-sm font-normal">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <p>No tags</p>
                      )}
                    </div>
                  </div>

                  {/* Post Reactions */}
                  <div className="flex flex-col text-gray-500 font-light">
                    <div className="mt-4 flex justify-end items-start md:flex-row lg:items-center ">
                      <div className="flex items-center mb-2 lg:mb-0">
                        <span className="mr-2">100 views</span>
                      </div>
                      <div className="flex items-center">
                        <ArrowTrendingUpIcon className='h-6 w-6 mr-2' /> 100
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <span> {item.submittedAt?.toDate().toLocaleDateString()} {item.submittedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No items found.</p>
          )}
        </div>
      </div>
    </div>
  );
}