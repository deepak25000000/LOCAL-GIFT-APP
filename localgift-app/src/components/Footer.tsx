import { Gift } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t bg-background py-8 md:py-12 mt-auto">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <Link href="/" className="flex items-center gap-2 mb-4">
                        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                            <Gift size={20} className="stroke-[2.5]" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">LocalGift</span>
                    </Link>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Connecting communities by making local item gifting easy, safe, and sustainable.
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold mb-4 text-foreground">Platform</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/dashboard" className="hover:text-primary transition-colors">Explore Items</Link></li>
                        <li><Link href="/create-listing" className="hover:text-primary transition-colors">Give an Item</Link></li>
                        <li><Link href="/map" className="hover:text-primary transition-colors">Local Map</Link></li>
                        <li><Link href="/safety" className="hover:text-primary transition-colors">Safety Guidelines</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4 text-foreground">Company</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                        <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                        <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
                <p>© {new Date().getFullYear()} LocalGift Inc. All rights reserved.</p>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                    <a href="#" className="hover:text-primary transition-colors">Instagram</a>
                    <a href="#" className="hover:text-primary transition-colors">Facebook</a>
                </div>
            </div>
        </footer>
    );
}
