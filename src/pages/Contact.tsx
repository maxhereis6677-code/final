import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SITE_NAME } from "@/lib/constants";
const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    setForm({
      name: "",
      phone: "",
      message: ""
    });
    setLoading(false);
  };
  return <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-[0.3em]">
            Get in Touch
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mt-2 mb-6">
            Contact Us
          </h1>
          <p className="text-muted-foreground">
            Have questions about our perfumes or need help with an order? 
            We're here to assist you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.6,
          delay: 0.1
        }}>
            <div className="bg-card rounded-lg border border-border p-6 shadow-elegant">
              <h2 className="font-serif text-2xl font-medium text-foreground mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="Enter your name" value={form.name} onChange={e => setForm({
                  ...form,
                  name: e.target.value
                })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="01700000000" value={form.phone} onChange={e => setForm({
                  ...form,
                  phone: e.target.value
                })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="How can we help you?" rows={5} value={form.message} onChange={e => setForm({
                  ...form,
                  message: e.target.value
                })} required />
                </div>
                <Button type="submit" disabled={loading} className="w-full btn-gold">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send Message
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-medium text-foreground mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Address</h3>
                    <p className="text-muted-foreground text-sm mt-1">Narayangonj, Araihazar, Dhaka</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Phone</h3>
                    <p className="text-muted-foreground text-sm mt-1">+880 1996640576</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Email</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                  </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-6">
              <h3 className="font-serif text-lg font-medium text-foreground mb-3">
                Business Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday - Thursday</span>
                  <span className="font-medium">10:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Friday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="font-serif text-lg font-medium text-foreground mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-muted-foreground">
                Our customer service team is available during business hours to 
                assist you with any questions about our products or your orders.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>;
};
export default Contact;