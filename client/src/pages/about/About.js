import React, { useEffect, useRef, useContext } from "react";
import "./About.css";
// contexts
import UserContext from "../../contexts/userContext";
// costants
import {
  ABOUT_ME_JPG,
  ABOUT_ART_1_PNG,
  ABOUT_ART_2_PNG,
  ABOUT_ART_3_PNG,
  ABOUT_ART_4_PNG,
} from "../../constants/images";
// data
import data from "./data.json";

const About = () => {
  const textRef1 = useRef(null);
  const textRef2 = useRef(null);
  const textRef3 = useRef(null);
  const typeInterval = useRef(null);
  const { dark } = useContext(UserContext);

  useEffect(() => {
  const minLength = Math.min(data[0].length, data[1].length, data[2].length);
  let i = 0;
  clearInterval(typeInterval.current);
  typeInterval.current = setInterval(() => {
    i = (i + 1) % minLength;
    if (textRef1.current) textRef1.current.innerText = data[0][i];
    if (textRef2.current) textRef2.current.innerText = data[1][i];
    if (textRef3.current) textRef3.current.innerText = data[2][i];
  }, 7500);
  window.scrollTo(0, 0);
}, []);


  return (
    <div className={`about ${dark ? "about__dark" : ""}`}>
      <div className="about__typewriter">
        <img className="about__me" src={ABOUT_ME_JPG} alt="" />
        <h1 ref={textRef1}>{data[0][0]}</h1>
        <h1 ref={textRef2} style={{ animationDelay: "0.5s" }}>
          {data[1][0]}
        </h1>
        <h1 ref={textRef3} style={{ animationDelay: "1s" }}>
          {data[2][0]}
        </h1>
      </div>
      <div
        className="about__title"
        style={{ marginTop: "-50px", marginBottom: "20px" }}
      >
        <h1>About Us</h1>
      </div>
      <p>
        I am <strong>Saurabh Kumar</strong>, a final year undergraduate student pursuing{" "}
        <strong>Information Technology</strong> at the{" "}
        <strong>Army Institute of Technology, Pune</strong>. My academic journey has
        been fueled by a strong passion for technology and innovation. With a robust
        foundation in computer science and hands-on experience in various technical
        domains, I aim to contribute effectively to the ever-evolving tech industry.
        <br />
        As part of my <strong>BE Project</strong>, I have developed this platform
        along with my teammates <strong>Sumit Soni</strong>, <strong>Prince Kumar</strong>, and{" "}
        <strong>Divakar Kumar Gupta</strong>, under the guidance of our project guide{" "}
        <strong>Prof. Vaishali Sachin Ingale</strong>.
      </p>


      <div className="about__title" style={{ marginTop: "70px" }}>
        <h1>Skills & Experiences</h1>
      </div>
      <div className="about__skill about__skillL">
        <div className="">
          <h1>Leadership</h1>
          <p>
            Leadership, to me, is about inspiring and empowering those around you to achieve a common goal. 
            It involves active listening, clear communication, and leading by example. 
            I have held multiple leadership positions in college clubs and technical committees where I’ve had the opportunity 
            to lead diverse teams, coordinate events, and mentor peers.
            <br />
            I strongly believe leadership is not a position but a responsibility, and I strive to bring positivity, collaboration, 
            and a solution-oriented mindset to any team I am a part of.
          </p>
        </div>
        <img src={ABOUT_ART_4_PNG} alt="" />
      </div>
      <div className="about__skill">
        <div className="">
          <h1>Web Development</h1>
          <p>
            I work as a MERN stack web developer. Every day, I spend my entire
            day experimenting with HTML, CSS, and JavaScript; dabbling with
            React and Node; and implementing a wide range of APIs to create
            awesome projects and utilities. I create websites that both
            entertain and inform. I'm very good at it!
            <br />
            I'm inquisitive, and I enjoy work that pushes me to learn new things
            and stretch in new directions. I do my best to stay up to date on
            technological advances so that I can meet challenges with tools that
            are well suited to the task at hand. The projects I follow on GitHub
            will give you an idea of the tools I prefer to use, and my
            Instapaper "Starred" list will give you an idea of the reading
            material I find interesting enough to share.
          </p>
        </div>
        <img src={ABOUT_ART_1_PNG} alt="" />
      </div>
      <div className="about__skill about__skillL">
        <div className="">
          <h1>Game Development</h1>
          <p>
            As a game developer, I understand Game Development as the art of
            creating games and describes the design, development and release of
            a game. It may involve concept generation, design, build, test and
            release. While you create a game, it is important to think about the
            game mechanics, rewards, player engagement and level design.
            <br /> Game Developers take the video game designer's ideas,
            drawings, rules, and turn them into a playable game with visuals and
            sound through writing code. The work of a games developer typically
            involves: Looking at the design specifications of video game
            designers and writing code to turn the designer's concepts into a
            playable game.
          </p>
        </div>
        <img src={ABOUT_ART_2_PNG} alt="" />
      </div>
      <div className="about__skill">
        <div className="">
          <h1>Programming</h1>
          <p>
            Programming is the process of creating a set of instructions that
            tell a computer how to perform a task. Programming can be done using
            a variety of computer programming languages, such as JavaScript,
            Python, and C++.
            <br />
            As a competitive programmer, I understand Competitive Programming as
            a mental sport which enables you to code a given problem under
            provided constraints. The purpose of this article is to guide every
            individual possessing a desire to excel in this sport. This article
            provides a detailed syllabus for Competitive Programming designed by
            industry experts to boost the preparation of the readers.
          </p>
        </div>
        <img src={ABOUT_ART_3_PNG} alt="" />
      </div>
      <div className="about__title">
        <h1>Contact Me</h1>
      </div>
      <div className="about__contactContainer">
  <iframe
    title="about__map"
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.269784054843!2d73.87251157335392!3d18.60693146653417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c70090000001%3A0x160a20f3d0273495!2sArmy%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1747382012690!5m2!1sen!2sin"
    width={window.innerWidth - 100}
    height="450"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    className="about__map"
    aria-hidden="false"
    tabIndex="0"
  />
</div>
    </div> 
  );
};

export default About;
