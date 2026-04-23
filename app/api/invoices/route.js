import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, invoices });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { invoiceNumber, projectName, clientName, amount, vatAmount, type, issueDate, dueDate, notes } = body;

    if (!invoiceNumber?.trim()) {
      return NextResponse.json({ success: false, error: "Invoice number is required." }, { status: 400 });
    }
    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json({ success: false, error: "Valid amount is required." }, { status: 400 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceNumber.trim(),
        projectName: projectName || null,
        clientName: clientName || null,
        amount: parseFloat(amount),
        vatAmount: vatAmount ? parseFloat(vatAmount) : null,
        type: type || null,
        issueDate: issueDate ? new Date(issueDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error) {
    console.error("Invoice create failed:", error);
    return NextResponse.json({ success: false, error: "Failed to create invoice." }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status, paidDate, notes } = body;
    if (!id) return NextResponse.json({ success: false, error: "id is required." }, { status: 400 });

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paidDate !== undefined && { paidDate: paidDate ? new Date(paidDate) : null }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("Invoice update failed:", error);
    return NextResponse.json({ success: false, error: "Failed to update invoice." }, { status: 500 });
  }
}
