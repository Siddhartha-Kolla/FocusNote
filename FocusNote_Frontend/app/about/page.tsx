import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, HelpCircle, Target, Lightbulb, Users } from "lucide-react";

// Reusable component for mission values since there are 3 similar cards
interface MissionValueProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function MissionValue({ icon, title, description }: MissionValueProps) {
  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-50 rounded-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Reusable component for team members
interface TeamMemberProps {
  name: string;
  role: string;
  specialty: string;
}

function TeamMember({ name, role, specialty }: TeamMemberProps) {
  return (
    <div className="text-center">
      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
      <p className="text-blue-600 text-sm font-medium mb-1">{role}</p>
      <p className="text-gray-600 text-sm">{specialty}</p>
    </div>
  );
}

// Reusable component for contact methods
interface ContactMethodProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  href?: string;
}

function ContactMethod({ icon, title, description, action, href }: ContactMethodProps) {
  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-lg">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
      {href ? (
        <a 
          href={href}
          className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
        >
          {action}
        </a>
      ) : (
        <Button 
          className={`text-sm px-4 py-2 ${
            title === "Live Chat" 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {action}
        </Button>
      )}
    </div>
  );
}

export default function AboutPage() {
  const missionValues = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Student-Focused",
      description: "Every feature is designed with student success in mind, making learning more efficient and effective."
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-blue-600" />,
      title: "Innovation-Driven", 
      description: "We leverage cutting-edge AI technology to solve real educational challenges and improve study habits."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Accessible Learning",
      description: "Making high-quality study tools available to all students, regardless of their background or resources."
    }
  ];

  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "AI Research Lead",
      specialty: "Machine Learning & OCR"
    },
    {
      name: "Marcus Rodriguez", 
      role: "Product Designer",
      specialty: "UX/UI Design"
    },
    {
      name: "Dr. Emily Watson",
      role: "Education Specialist", 
      specialty: "Learning Sciences"
    },
    {
      name: "James Park",
      role: "Software Engineer",
      specialty: "Full-Stack Development"
    }
  ];

  const contactMethods = [
    {
      icon: <Mail className="w-8 h-8 text-gray-600" />,
      title: "Email Support",
      description: "Get help with your account or technical issues",
      action: "support@focusnote.com",
      href: "mailto:support@focusnote.com"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-green-600" />,
      title: "Live Chat", 
      description: "Chat with our team for immediate assistance",
      action: "Start Chat"
    },
    {
      icon: <HelpCircle className="w-8 h-8 text-blue-600" />,
      title: "Help Center",
      description: "Browse our knowledge base and tutorials", 
      action: "Visit Help Center"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* About Us Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-6">
              About Us
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Empowering Students with{" "}
              <span className="text-blue-600">Smart Technology</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to revolutionize how students learn by transforming traditional
              note-taking into intelligent, AI-powered study experiences.
            </p>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                At FocusNote, we believe that every student deserves access to tools that make learning more efficient and
                effective. Our AI-powered platform transforms the age-old practice of handwritten note-taking into a smart,
                digital experience that adapts to each student's unique learning style and academic goals.
              </p>
            </div>

            {/* Mission Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {missionValues.map((value, index) => (
                <MissionValue
                  key={index}
                  icon={value.icon}
                  title={value.title}
                  description={value.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    FocusNote was born from a simple observation: students spend countless hours
                    rewriting and organizing their handwritten notes, time that could be better spent
                    actually learning and understanding the material.
                  </p>
                  <p>
                    Our founding team, composed of technologists and former students,
                    came together with a shared vision of using artificial intelligence to bridge the gap
                    between traditional note-taking and modern digital learning tools.
                  </p>
                  <p>
                    Today, we're proud to serve thousands of students worldwide, helping them
                    transform their handwritten notes into intelligent study guides that adapt to their
                    learning needs and accelerate their academic success.
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-8">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
                  <div className="text-gray-600">Students Helped</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
                  <div className="text-gray-600">Notes Processed</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">99.5%</div>
                  <div className="text-gray-600">OCR Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meet Our Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-gray-600">
                The passionate individuals behind FocusNote
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <TeamMember
                  key={index}
                  name={member.name}
                  role={member.role}
                  specialty={member.specialty}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Get In Touch Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Get In Touch
              </h2>
              <p className="text-lg text-gray-600">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {contactMethods.map((method, index) => (
                <ContactMethod
                  key={index}
                  icon={method.icon}
                  title={method.title}
                  description={method.description}
                  action={method.action}
                  href={method.href}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}