import type { GetServerSidePropsContext, NextPage } from "next";
import toast from "react-hot-toast";
import PostFeed from "../components/PostFeed";
import Loader from "../components/Loader";
import { firestore, fromMillis, postToJSON } from "../lib/firebase";

import { useState } from "react";
import { Post } from "../interfaces/data-model";
import {
  collection,
  collectionGroup,
  getDocs,
  limit,
  query,
  where,
  orderBy,
  startAfter,
} from "firebase/firestore";

// Max post to query per page
const LIMIT = 1;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const q = query(
    collectionGroup(firestore, "posts"),
    where("published", "==", true),
    orderBy("createdAt", "desc"),
    limit(LIMIT)
  );

  const posts = (await getDocs(q)).docs.map(postToJSON);
  return {
    props: { posts }, // will be passed to the page component as props
  };
}

const Home = (props: { posts: Post[] }) => {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const cursor =
      typeof last.createdAt === "number"
        ? fromMillis(last.createdAt)
        : last.createdAt;

    const q = query(
      collectionGroup(firestore, "posts"),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      startAfter(cursor),
      limit(LIMIT)
    );

    // TODO investigate potential issue with this
    const newPosts = (await getDocs(q)).docs.map((doc) => doc.data()) as Post[];

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <PostFeed posts={posts} />

      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}

      <Loader show={loading} />

      {postsEnd && "You have reached the end!"}
    </main>
  );
};

export default Home;
